'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Node, Relationship, NvlOptions } from '@neo4j-nvl/base';
import type { MouseEventCallbacks } from '@neo4j-nvl/react';

// Dynamically import NVL to avoid SSR issues (needs document)
const InteractiveNvlWrapper = dynamic(
  () => import('@neo4j-nvl/react').then((mod) => mod.InteractiveNvlWrapper),
  { ssr: false }
);
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { StakeholderView } from '@/types/graph';

interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

interface GraphRelationship {
  id: string | number;
  type: string;
  from: string;
  to: string;
  properties?: Record<string, unknown>;
}

interface GraphData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

interface BaseGraphProps {
  data: GraphData;
  onNodeClick?: (node: Node) => void;
  onRelationshipClick?: (rel: Relationship) => void;
  colorScheme?: StakeholderView;
  className?: string;
  highlightedCategory?: string | null;
}

// Color schemes per stakeholder view
const COLOR_SCHEMES: Record<StakeholderView, Record<string, string>> = {
  consumer: {
    Building: '#3B82F6',      // Blue
    BuildingElement: '#6366F1', // Indigo
    Product: '#10B981',       // Emerald
    Certification: '#F59E0B', // Amber
    Manufacturer: '#8B5CF6',  // Purple
  },
  manufacturer: {
    Building: '#1E40AF',
    BuildingElement: '#4338CA',
    Product: '#059669',
    Plant: '#EA580C',         // Orange
    Manufacturer: '#7C3AED',
    Material: '#B45309',
  },
  recycler: {
    Building: '#1E40AF',
    BuildingElement: '#4338CA',
    Product: '#10B981',
    Material: '#047857',
    Certification: '#F59E0B',
  },
  regulator: {
    Building: '#1E3A8A',
    BuildingElement: '#312E81',
    Product: '#065F46',
    Certification: '#92400E',
    Manufacturer: '#5B21B6',
    Plant: '#9A3412',
    Location: '#374151',
  },
};

// Node size by type
const NODE_SIZES: Record<string, number> = {
  Building: 50,
  BuildingElement: 35,
  Product: 30,
  Manufacturer: 28,
  Plant: 25,
  Certification: 22,
  Material: 20,
  Location: 20,
};

// Map building element categories to related node patterns
const CATEGORY_NODE_PATTERNS: Record<string, string[]> = {
  'Foundation': ['Foundation', 'Concrete', 'Steel', 'Rebar'],
  'Structure': ['Structure', 'CLT', 'Wood'],
  'Envelope': ['Envelope', 'Glass', 'Insulation', 'Aluminum', 'Rockwool', 'AGC', 'Reynaers'],
  'Systems': ['Systems', 'HVAC', 'Daikin'],
};

export default function BaseGraph({
  data,
  onNodeClick,
  onRelationshipClick,
  colorScheme = 'consumer',
  className = '',
  highlightedCategory = null,
}: BaseGraphProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nvlRef = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeCardExpanded, setIsNodeCardExpanded] = useState(false);

  const colors = COLOR_SCHEMES[colorScheme];

  // Check if a node matches the highlighted category
  const isNodeHighlighted = (node: GraphNode): boolean => {
    if (!highlightedCategory) return false;
    const patterns = CATEGORY_NODE_PATTERNS[highlightedCategory] || [];
    const nodeName = String(node.properties?.name || '');
    const nodeCategory = String(node.properties?.category || '');
    return patterns.some(pattern => 
      nodeName.toLowerCase().includes(pattern.toLowerCase()) ||
      nodeCategory.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  // Transform nodes for NVL display
  const styledNodes: Node[] = data.nodes.map((node) => {
    const primaryLabel = node.labels?.[0] || 'Unknown';
    const highlighted = isNodeHighlighted(node);
    return {
      id: node.id,
      color: highlighted ? '#00D9FF' : (colors[primaryLabel] || '#6B7280'),
      size: highlighted ? (NODE_SIZES[primaryLabel] || 25) * 1.3 : (NODE_SIZES[primaryLabel] || 25),
      caption: String(node.properties?.name || node.id),
      // Store original data for detail panel
      labels: node.labels,
      properties: node.properties,
    } as Node;
  });

  // Transform relationships for NVL display
  const styledRelationships: Relationship[] = data.relationships.map((rel) => ({
    id: String(rel.id),
    from: rel.from,
    to: rel.to,
    color: '#94A3B8',
    width: 2,
    caption: rel.type.replace(/_/g, ' '),
    type: rel.type,
    properties: rel.properties,
  } as Relationship));

  const handleNodeClick = useCallback(
    (node: Node) => {
      setSelectedNode(node);
      setIsNodeCardExpanded(false); // Start collapsed
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  const handleRelClick = useCallback(
    (rel: Relationship) => {
      onRelationshipClick?.(rel);
    },
    [onRelationshipClick]
  );

  const mouseEventCallbacks: MouseEventCallbacks = {
    onNodeClick: handleNodeClick,
    onRelationshipClick: handleRelClick,
    onCanvasClick: () => setSelectedNode(null),
    onZoom: true,
    onPan: true,
    onDrag: true,
  };

  const nvlOptions: NvlOptions = {
    layout: 'forceDirected',
    allowDynamicMinZoom: true,
    initialZoom: 1,
    relationshipThreshold: 0.55,
    disableTelemetry: true, // Prevent Segment analytics calls that get blocked by ad blockers
  };

  return (
    <div className={`relative w-full h-full min-h-[400px] bg-slate-950 overflow-hidden ${className}`}>
      {data.nodes.length > 0 ? (
        <InteractiveNvlWrapper
          ref={nvlRef}
          nodes={styledNodes}
          rels={styledRelationships}
          nvlOptions={nvlOptions}
          mouseEventCallbacks={mouseEventCallbacks}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400">
          <p>No graph data available. Make sure the building exists in Neo4j.</p>
        </div>
      )}

      {/* Node detail panel - collapsed */}
      {selectedNode && !isNodeCardExpanded && (
        <div
          onClick={() => setIsNodeCardExpanded(true)}
          className="absolute top-4 right-4 bg-slate-900/95 border border-slate-700 backdrop-blur rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-slate-800/95 transition-colors cursor-pointer shadow-xl"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setIsNodeCardExpanded(true)}
        >
          <Badge
            variant="secondary"
            className="text-xs"
            style={{ backgroundColor: colors[(selectedNode as unknown as GraphNode).labels?.[0]] || '#6B7280' }}
          >
            {(selectedNode as unknown as GraphNode).labels?.[0]}
          </Badge>
          <span className="font-semibold text-white">
            {String((selectedNode as unknown as GraphNode).properties?.name || selectedNode.id)}
          </span>
          <span
            onClick={(e) => { e.stopPropagation(); setSelectedNode(null); }}
            className="text-slate-400 hover:text-white transition-colors ml-2 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setSelectedNode(null); }}}
          >
            ✕
          </span>
        </div>
      )}

      {/* Node detail panel - expanded */}
      {selectedNode && isNodeCardExpanded && (
        <Card className="absolute top-4 right-4 w-80 bg-slate-900/95 border-slate-700 backdrop-blur shadow-xl">
          <CardHeader 
            className="pb-2 cursor-pointer hover:bg-slate-800/50 transition-colors"
            onClick={() => setIsNodeCardExpanded(false)}
          >
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg text-white">
                {String((selectedNode as unknown as GraphNode).properties?.name || selectedNode.id)}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setSelectedNode(null); }}
                className="text-slate-400 hover:text-white -mt-1 -mr-2"
              >
                ✕
              </Button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {((selectedNode as unknown as GraphNode).labels || []).map((label: string) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="text-xs"
                  style={{ backgroundColor: colors[label] || '#6B7280' }}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <dl className="text-sm space-y-1">
              {Object.entries((selectedNode as unknown as GraphNode).properties || {})
                .filter(([key]) => key !== 'name')
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-slate-700">
                    <dt className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                    <dd className="text-white font-medium text-right max-w-[160px] truncate">
                      {formatValue(value)}
                    </dd>
                  </div>
                ))}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (typeof value === 'bigint') {
    return Number(value).toLocaleString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  // Handle Neo4j Integer objects
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    // Neo4j Integer (has low/high properties)
    if ('low' in obj && 'high' in obj) {
      return Number(obj.low).toLocaleString();
    }
    // Neo4j Date (has year, month, day)
    if ('year' in obj && 'month' in obj && 'day' in obj) {
      const year = Number((obj.year as Record<string, unknown>)?.low ?? obj.year);
      const month = Number((obj.month as Record<string, unknown>)?.low ?? obj.month);
      const day = Number((obj.day as Record<string, unknown>)?.low ?? obj.day);
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    // Fallback for other objects
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

