'use client';

import { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RiskItem } from '@/types/graph';

interface RiskSummaryProps {
  buildingId: string;
}

const SEVERITY_COLORS = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-blue-500/20 text-blue-400',
};

const RISK_ICONS: Record<RiskItem['type'], string> = {
  single_source: '⚠️',
  expiring_cert: '📋',
  concentration: '🏭',
  geographic: '🌍',
};

export default function RiskSummary({ buildingId }: RiskSummaryProps) {
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchRisks() {
      try {
        const response = await fetch(`/api/graph/risks/${buildingId}`);
        if (response.ok) {
          const data = await response.json();
          setRisks(data.risks);
        }
      } catch (err) {
        console.error('Failed to fetch risks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRisks();
  }, [buildingId]);

  if (loading) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 shadow-lg animate-pulse">
        <div className="h-4 w-32 bg-slate-700 rounded" />
      </div>
    );
  }

  const highCount = risks.filter(r => r.severity === 'high').length;
  const mediumCount = risks.filter(r => r.severity === 'medium').length;
  const lowCount = risks.filter(r => r.severity === 'low').length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="bg-slate-900/90 backdrop-blur-sm hover:bg-slate-800/90 rounded-lg p-3 transition-colors border border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <span className="text-sm font-medium text-white">Risk</span>
            </div>
            <div className="flex items-center gap-2">
              {risks.length === 0 ? (
                <span className="text-xs text-emerald-400">✓ Clear</span>
              ) : (
                <div className="flex gap-1">
                  {highCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                      {highCount}
                    </span>
                  )}
                  {mediumCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                      {mediumCount}
                    </span>
                  )}
                  {lowCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                      {lowCount}
                    </span>
                  )}
                </div>
              )}
              <ChevronDown 
                className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              />
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1 bg-slate-900/90 backdrop-blur-sm rounded-lg p-2 space-y-2 border border-slate-700/50 shadow-lg">
          {risks.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-2">No risks detected</p>
          ) : (
            risks.map((risk, i) => (
              <div key={i} className="p-2 bg-slate-800/50 rounded">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{RISK_ICONS[risk.type]}</span>
                    <span className="text-xs font-medium text-white">{risk.title}</span>
                  </div>
                  <Badge className={`text-[10px] px-1.5 py-0 ${SEVERITY_COLORS[risk.severity]}`}>
                    {risk.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{risk.description}</p>
              </div>
            ))
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

