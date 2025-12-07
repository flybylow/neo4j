import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '@/lib/neo4j';
import type { RiskItem } from '@/types/graph';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: buildingId } = await params;
    const risks: RiskItem[] = [];

    // 1. Single source risk: Products with only one supplier
    const singleSource = await runQuery<{ product: string; soleSupplier: string }>(
      `
      MATCH (b:Building {id: $buildingId})-[:COMPOSED_OF]->(e:BuildingElement)-[:USES_PRODUCT]->(p:Product)-[:SUPPLIED_BY]->(m:Manufacturer)
      WITH p, count(DISTINCT m) as supplierCount
      WHERE supplierCount = 1
      MATCH (p)-[:SUPPLIED_BY]->(m:Manufacturer)
      RETURN p.name as product, m.name as soleSupplier
      `,
      { buildingId }
    );

    if (singleSource.length > 0) {
      risks.push({
        type: 'single_source',
        severity: singleSource.length > 5 ? 'high' : 'medium',
        title: 'Single Supplier Risk',
        description: `${singleSource.length} products have only one supplier. Supply disruptions could impact the project.`,
        affectedProducts: singleSource.map((r) => r.product),
      });
    }

    // 2. Expiring certifications (next 90 days)
    const expiring = await runQuery<{ product: string; expiryDate: string }>(
      `
      MATCH (b:Building {id: $buildingId})-[:COMPOSED_OF]->(e:BuildingElement)-[:USES_PRODUCT]->(p:Product)-[:HAS_EPD]->(c:Certification)
      WHERE c.validUntil <= date() + duration('P90D')
      RETURN p.name as product, toString(c.validUntil) as expiryDate
      ORDER BY c.validUntil
      LIMIT 10
      `,
      { buildingId }
    );

    if (expiring.length > 0) {
      risks.push({
        type: 'expiring_cert',
        severity: 'medium',
        title: 'Expiring Certifications',
        description: `${expiring.length} EPDs expire within 90 days. Products may lose compliance status.`,
        affectedProducts: expiring.map((r) => r.product),
      });
    }

    // 3. Supplier concentration: Single manufacturer supplies many products
    const concentration = await runQuery<{ manufacturer: string; productCount: number }>(
      `
      MATCH (b:Building {id: $buildingId})-[:COMPOSED_OF]->(e:BuildingElement)-[:USES_PRODUCT]->(p:Product)-[:SUPPLIED_BY]->(m:Manufacturer)
      WITH m, count(p) as productCount
      WHERE productCount > 3
      RETURN m.name as manufacturer, productCount
      ORDER BY productCount DESC
      LIMIT 5
      `,
      { buildingId }
    );

    if (concentration.length > 0) {
      const topConcentration = concentration[0];
      risks.push({
        type: 'concentration',
        severity: topConcentration.productCount > 10 ? 'high' : 'low',
        title: 'Supplier Concentration',
        description: `${topConcentration.manufacturer} supplies ${topConcentration.productCount} products. High dependency on single supplier.`,
        affectedProducts: [topConcentration.manufacturer],
      });
    }

    // 4. Geographic concentration
    const geographic = await runQuery<{ country: string; productCount: number }>(
      `
      MATCH (b:Building {id: $buildingId})-[:COMPOSED_OF]->(e:BuildingElement)-[:USES_PRODUCT]->(p:Product)-[:MANUFACTURED_AT]->(pl:Plant)-[:LOCATED_IN]->(l:Location)
      WITH l.country as country, count(DISTINCT p) as productCount
      WHERE productCount > 5
      RETURN country, productCount
      ORDER BY productCount DESC
      LIMIT 3
      `,
      { buildingId }
    );

    if (geographic.length > 0 && geographic[0].productCount > 10) {
      risks.push({
        type: 'geographic',
        severity: 'medium',
        title: 'Geographic Concentration',
        description: `${geographic[0].productCount} products sourced from ${geographic[0].country}. Regional disruptions could affect supply.`,
        affectedProducts: [`${geographic[0].country} (${geographic[0].productCount} products)`],
      });
    }

    return NextResponse.json({ risks });
  } catch (error) {
    console.error('Error fetching risk data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk data', details: String(error) },
      { status: 500 }
    );
  }
}

