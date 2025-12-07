import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '@/lib/neo4j';

interface ExpandResult {
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
    const { id: nodeId } = await params;

    // Get all nodes connected to this node (one hop)
    const result = await runQuery<ExpandResult>(
      `
      MATCH (n {id: $nodeId})-[r]-(connected)
      WITH collect(DISTINCT connected) as connectedNodes, collect(DISTINCT r) as rels
      RETURN 
        [node IN connectedNodes | {
          id: node.id,
          labels: labels(node),
          properties: properties(node)
        }] as nodes,
        [rel IN rels | {
          id: toString(id(rel)),
          type: type(rel),
          from: startNode(rel).id,
          to: endNode(rel).id,
          properties: properties(rel)
        }] as relationships
      `,
      { nodeId }
    );

    const graphData = result[0] || { nodes: [], relationships: [] };

    return NextResponse.json(graphData);
  } catch (error) {
    console.error('Error expanding node:', error);
    return NextResponse.json(
      { error: 'Failed to expand node', details: String(error) },
      { status: 500 }
    );
  }
}

