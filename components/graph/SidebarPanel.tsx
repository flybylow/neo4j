'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CarbonBreakdown, RiskItem } from '@/types/graph';
import { useEffect } from 'react';

interface SidebarPanelProps {
  buildingId: string;
}

export default function SidebarPanel({ buildingId }: SidebarPanelProps) {
  const [activePanel, setActivePanel] = useState<'carbon' | 'risk' | null>(null);
  const [carbonData, setCarbonData] = useState<CarbonBreakdown | null>(null);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [carbonRes, risksRes] = await Promise.all([
          fetch(`/api/graph/carbon/${buildingId}`),
          fetch(`/api/graph/risks/${buildingId}`),
        ]);
        
        if (carbonRes.ok) {
          setCarbonData(await carbonRes.json());
        }
        if (risksRes.ok) {
          const data = await risksRes.json();
          setRisks(data.risks);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [buildingId]);

  const togglePanel = (panel: 'carbon' | 'risk') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const isNegative = carbonData ? carbonData.gwp < 0 : false;
  const highRiskCount = risks.filter(r => r.severity === 'high').length;
  const mediumRiskCount = risks.filter(r => r.severity === 'medium').length;
  const lowRiskCount = risks.filter(r => r.severity === 'low').length;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* Expanded panel - appears ABOVE the bar */}
      {activePanel && (
        <div className="mx-4 mb-2 animate-in slide-in-from-bottom-2 duration-200">
          {activePanel === 'carbon' && carbonData && (
            <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50 shadow-xl max-w-md">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                🌱 Embodied Carbon Breakdown
              </h3>
              <div className="space-y-2">
                {carbonData.children?.map((cat) => {
                  const isNeg = cat.gwp < 0;
                  return (
                    <div key={cat.name} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isNeg ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(Math.abs(cat.percentage), 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium w-16 text-right ${isNeg ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {isNeg ? '' : '+'}{(cat.gwp / 1000).toFixed(1)}t
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-700">
                Negative values = carbon sequestration (e.g., CLT wood)
              </p>
            </div>
          )}

          {activePanel === 'risk' && (
            <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50 shadow-xl max-w-md">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                🛡️ Supply Chain Risks
              </h3>
              {risks.length === 0 ? (
                <p className="text-sm text-emerald-400">✓ No significant risks detected</p>
              ) : (
                <div className="space-y-2">
                  {risks.map((risk, i) => (
                    <div key={i} className={`p-2 rounded border-l-2 ${
                      risk.severity === 'high' ? 'bg-red-950/30 border-red-500' :
                      risk.severity === 'medium' ? 'bg-amber-950/30 border-amber-500' :
                      'bg-blue-950/30 border-blue-500'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{risk.title}</span>
                        <Badge className={`text-[10px] ${
                          risk.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                          risk.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {risk.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{risk.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom bar */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 px-4 py-2">
        <div className="flex items-center gap-4">
          {/* Carbon button */}
          <button
            onClick={() => togglePanel('carbon')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              activePanel === 'carbon' 
                ? 'bg-slate-700/50 text-white' 
                : 'hover:bg-slate-800/50 text-slate-300'
            }`}
          >
            <span className="text-base">🌱</span>
            <span className="text-sm font-medium">Carbon</span>
            {!loading && carbonData && (
              <span className={`text-sm font-bold ${isNegative ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isNegative ? '' : '+'}{(carbonData.gwp / 1000).toFixed(1)}t
              </span>
            )}
            {activePanel === 'carbon' ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Risk button */}
          <button
            onClick={() => togglePanel('risk')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              activePanel === 'risk' 
                ? 'bg-slate-700/50 text-white' 
                : 'hover:bg-slate-800/50 text-slate-300'
            }`}
          >
            <span className="text-base">🛡️</span>
            <span className="text-sm font-medium">Risk</span>
            {!loading && (
              <div className="flex gap-1">
                {risks.length === 0 ? (
                  <span className="text-xs text-emerald-400">✓</span>
                ) : (
                  <>
                    {highRiskCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                        {highRiskCount}
                      </span>
                    )}
                    {mediumRiskCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                        {mediumRiskCount}
                      </span>
                    )}
                    {lowRiskCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                        {lowRiskCount}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
            {activePanel === 'risk' ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
