import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '@/lib/neo4j';

interface CarbonResult {
  category: string;
  categoryGWP: unknown;
  percentage: unknown;
}

// Convert Neo4j integers/floats to JS numbers
function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'bigint') {
    return Number(value);
  }
  // Handle Neo4j Integer objects (has low/high properties)
  if (typeof value === 'object' && value !== null && 'low' in value) {
    return Number((value as { low: number }).low);
  }
  return Number(value) || 0;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: buildingId } = await params;

    // Get carbon breakdown by building element category
    const result = await runQuery<CarbonResult>(
      `
      MATCH (b:Building {id: $buildingId})-[:COMPOSED_OF]->(e:BuildingElement)-[:USES_PRODUCT]->(p:Product)
      WITH e.category as category, sum(p.gwp * coalesce(p.quantity, 1)) as categoryGWP
      WITH collect({category: category, gwp: categoryGWP}) as categories
      WITH categories, reduce(total = 0.0, c IN categories | total + c.gwp) as totalGWP
      UNWIND categories as cat
      RETURN cat.category as category, cat.gwp as categoryGWP,
             CASE WHEN totalGWP = 0 THEN 0 ELSE round(cat.gwp * 100.0 / totalGWP, 1) END as percentage
      ORDER BY categoryGWP DESC
      `,
      { buildingId }
    );

    const totalGWP = result.reduce((sum, cat) => sum + toNumber(cat.categoryGWP), 0);

    // Get building name
    const buildingResult = await runQuery<{ name: string }>(
      `MATCH (b:Building {id: $buildingId}) RETURN b.name as name`,
      { buildingId }
    );

    const buildingName = buildingResult[0]?.name || 'Building';

    return NextResponse.json({
      name: buildingName,
      gwp: Math.round(totalGWP),
      percentage: 100,
      children: result.map((cat) => ({
        name: cat.category,
        gwp: Math.round(toNumber(cat.categoryGWP)),
        percentage: toNumber(cat.percentage),
      })),
    });
  } catch (error) {
    console.error('Error fetching carbon data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carbon data', details: String(error) },
      { status: 500 }
    );
  }
}

