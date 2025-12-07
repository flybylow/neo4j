import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '@/lib/neo4j';

// Stakeholder view filters - which node types each view can see
const VIEW_FILTERS: Record<string, string[]> = {
  consumer: ['Building', 'BuildingElement', 'Product', 'Certification', 'Manufacturer'],
  manufacturer: ['Building', 'BuildingElement', 'Product', 'Plant', 'Manufacturer', 'Material'],
  recycler: ['Product', 'Material', 'Certification', 'BuildingElement'],
  regulator: ['Building', 'BuildingElement', 'Product', 'Certification', 'Manufacturer', 'Plant', 'Location'],
};

interface GraphResult {
  nodes: Array<{
    id: string;
    labels: string[];
    properties: Record<string, unknown>;
  }>;
  relationships: Array<{
    id: string;
    type: string;
    from: string;
    to: string;
    properties: Record<string, unknown>;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: buildingId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const depth = Math.min(parseInt(searchParams.get('depth') || '2'), 4); // Max depth 4
    const view = searchParams.get('view') || 'consumer';

    const allowedLabels = VIEW_FILTERS[view] || VIEW_FILTERS.consumer;

    // Cypher query to get building graph with depth limit
    const result = await runQuery<GraphResult>(
      `
      MATCH (b:Building {id: $buildingId})
      CALL {
        WITH b
        MATCH path = (b)-[*1..${depth}]-(connected)
        WHERE any(label IN labels(connected) WHERE label IN $allowedLabels)
        RETURN nodes(path) as pathNodes, relationships(path) as pathRels
      }
      WITH collect(pathNodes) as allNodes, collect(pathRels) as allRels
      UNWIND allNodes as nodeList
      UNWIND nodeList as node
      WITH collect(DISTINCT node) as uniqueNodes, allRels
      UNWIND allRels as relList
      UNWIND relList as rel
      WITH uniqueNodes, collect(DISTINCT rel) as uniqueRels
      RETURN 
        [n IN uniqueNodes | {
          id: n.id,
          labels: labels(n),
          properties: properties(n)
        }] as nodes,
        [r IN uniqueRels | {
          id: toString(id(r)),
          type: type(r),
          from: startNode(r).id,
          to: endNode(r).id,
          properties: properties(r)
        }] as relationships
      `,
      { buildingId, allowedLabels }
    );

    const graphData = result[0] || { nodes: [], relationships: [] };

    return NextResponse.json(graphData);
  } catch (error) {
    console.error('Error fetching building graph:', error);
    return NextResponse.json(
      { error: 'Failed to fetch building graph', details: String(error) },
      { status: 500 }
    );
  }
}

