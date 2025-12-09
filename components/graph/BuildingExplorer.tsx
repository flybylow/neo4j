'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Node } from '@neo4j-nvl/base';
import BaseGraph from './BaseGraph';
import BuildingElementCard from './BuildingElementCard';
import { BuildingModel } from '@/components/3d';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { StakeholderView, GraphData } from '@/types/graph';

interface BuildingExplorerProps {
  buildingId: string;
  initialView?: StakeholderView;
  depth?: number;
}

const VIEW_LABELS: Record<StakeholderView, string> = {
  consumer: 'Consumer',
  manufacturer: 'Manufacturer',
  recycler: 'Recycler',
  regulator: 'Regulator',
};

const VIEW_DESCRIPTIONS: Record<StakeholderView, string> = {
  consumer: 'Products, certifications, and manufacturers',
  manufacturer: 'Supply chain, plants, and materials',
  recycler: 'Material composition and recyclability',
  regulator: 'Full compliance and traceability view',
};

type ViewMode = 'graph' | '3d' | 'combined';

export default function BuildingExplorer({
  buildingId,
  initialView = 'consumer',
  depth = 2,
}: BuildingExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get view mode from URL, default to 'graph'
  const viewModeParam = searchParams.get('view') as ViewMode | null;
  const viewMode: ViewMode = viewModeParam && ['graph', '3d', 'combined'].includes(viewModeParam) 
    ? viewModeParam 
    : 'graph';

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stakeholderView, setStakeholderView] = useState<StakeholderView>(initialView);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Update URL when view mode changes
  const setViewMode = useCallback((mode: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`/building/${buildingId}?${params.toString()}`, { scroll: false });
  }, [router, buildingId, searchParams]);

  // Fetch graph data
  useEffect(() => {
    async function fetchGraph() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/graph/building/${buildingId}?depth=${depth}&view=${stakeholderView}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch graph');
        }
        const data = await response.json();
        setGraphData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchGraph();
  }, [buildingId, depth, stakeholderView]);

  // Handle node click - expand to show connected nodes
  const handleNodeClick = useCallback(
    async (node: Node) => {
      // Only expand Product and Manufacturer nodes
      const nodeLabels = (node as unknown as { labels?: string[] }).labels || [];
      if (!nodeLabels.includes('Product') && !nodeLabels.includes('Manufacturer')) {
        return;
      }

      try {
        const response = await fetch(`/api/graph/expand/${node.id}`);
        if (!response.ok) return;
        const expandedData: GraphData = await response.json();

        // Merge with existing data
        setGraphData((prev) => {
          if (!prev) return expandedData;
          const existingNodeIds = new Set(prev.nodes.map((n) => n.id));
          const existingRelIds = new Set(prev.relationships.map((r) => String(r.id)));

          return {
            nodes: [
              ...prev.nodes,
              ...expandedData.nodes.filter((n) => !existingNodeIds.has(n.id)),
            ],
            relationships: [
              ...prev.relationships,
              ...expandedData.relationships.filter((r) => !existingRelIds.has(String(r.id))),
            ],
          };
        });
      } catch (err) {
        console.error('Failed to expand node:', err);
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-red-950/20">
        <p className="text-red-400 mb-2">Error loading graph</p>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact toolbar */}
      <div className="shrink-0 px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex bg-slate-800 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('graph')}
              className={`h-7 px-2 text-xs ${viewMode === 'graph' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              📊 Graph
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('3d')}
              className={`h-7 px-2 text-xs ${viewMode === '3d' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🏠 3D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('combined')}
              className={`h-7 px-2 text-xs ${viewMode === 'combined' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🔗 Combined
            </Button>
          </div>
          
          {/* Stakeholder tabs - only show for graph view */}
          {viewMode === 'graph' && (
            <Tabs value={stakeholderView} onValueChange={(v) => setStakeholderView(v as StakeholderView)}>
              <TabsList className="bg-slate-800 h-8">
                {(Object.keys(VIEW_LABELS) as StakeholderView[]).map((view) => (
                  <TabsTrigger
                    key={view}
                    value={view}
                    className="data-[state=active]:bg-slate-600 text-xs px-2 h-6"
                  >
                    {VIEW_LABELS[view]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>
        
        {/* Right side info */}
        <div className="flex items-center gap-3">
          {(viewMode === 'graph' || viewMode === 'combined') && (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <LegendItem color="#3B82F6" label="Building" />
                <LegendItem color="#10B981" label="Product" />
                <LegendItem color="#8B5CF6" label="Manufacturer" />
              </div>
              {graphData && (
                <Badge variant="outline" className="text-slate-500 border-slate-700 text-xs">
                  {graphData.nodes.length} · {graphData.relationships.length}
                </Badge>
              )}
            </>
          )}
          {viewMode === '3d' && (
            <span className="text-xs text-slate-400">
              Click elements to explore • Drag to rotate
            </span>
          )}
        </div>
      </div>

      {/* Content - Graph, 3D Model, or Combined */}
      <div className="flex-1 min-h-0">
        {viewMode === 'graph' && graphData && (
          <BaseGraph
            data={graphData}
            onNodeClick={handleNodeClick}
            colorScheme={stakeholderView}
            className="h-full"
          />
        )}
        {viewMode === '3d' && (
          <div className="h-full relative">
            <BuildingModel
              onElementClick={(element) => {
                setSelectedElement(element);
                setHighlightedElement(element);
              }}
              highlightedElement={selectedElement}
            />
            {/* Element card overlay */}
            {selectedElement && (
              <div className="absolute bottom-4 left-4 z-20 animate-in slide-in-from-bottom-4 duration-300">
                <BuildingElementCard
                  element={selectedElement}
                  onClose={() => setSelectedElement(null)}
                  onViewInGraph={() => {
                    setViewMode('graph');
                    setHighlightedElement(selectedElement);
                  }}
                />
              </div>
            )}
          </div>
        )}
        {viewMode === 'combined' && (
          <div className="h-full flex">
            {/* Graph on left */}
            <div className="w-1/2 h-full border-r border-slate-700 relative">
              {graphData && (
                <BaseGraph
                  data={graphData}
                  onNodeClick={handleNodeClick}
                  colorScheme={stakeholderView}
                  className="h-full"
                  highlightedCategory={highlightedElement || selectedElement}
                />
              )}
              {/* Element card - shows on selection */}
              {selectedElement && (
                <div className="absolute bottom-4 left-4 z-20 animate-in slide-in-from-bottom-4 duration-300">
                  <BuildingElementCard
                    element={selectedElement}
                    onClose={() => setSelectedElement(null)}
                    onViewInGraph={() => {
                      setViewMode('graph');
                      setHighlightedElement(selectedElement);
                    }}
                  />
                </div>
              )}
            </div>
            {/* 3D Model on right */}
            <div className="w-1/2 h-full relative">
              <BuildingModel
                onElementClick={(element) => {
                  setSelectedElement(element);
                  setHighlightedElement(element);
                }}
                highlightedElement={selectedElement}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

