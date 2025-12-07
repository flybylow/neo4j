'use client';

import { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import type { CarbonBreakdown } from '@/types/graph';

interface CarbonSummaryProps {
  buildingId: string;
}

export default function CarbonSummary({ buildingId }: CarbonSummaryProps) {
  const [data, setData] = useState<CarbonBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchCarbon() {
      try {
        const response = await fetch(`/api/graph/carbon/${buildingId}`);
        if (response.ok) {
          setData(await response.json());
        }
      } catch (err) {
        console.error('Failed to fetch carbon:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCarbon();
  }, [buildingId]);

  if (loading) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 shadow-lg animate-pulse">
        <div className="h-4 w-32 bg-slate-700 rounded" />
      </div>
    );
  }

  if (!data) return null;

  const isNegative = data.gwp < 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="bg-slate-900/90 backdrop-blur-sm hover:bg-slate-800/90 rounded-lg p-3 transition-colors border border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌱</span>
              <span className="text-sm font-medium text-white">Carbon</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${isNegative ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isNegative ? '' : '+'}{(data.gwp / 1000).toFixed(1)}t
              </span>
              <ChevronDown 
                className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              />
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 space-y-2 border border-slate-700/50 shadow-lg">
          {data.children?.map((cat) => {
            const isNeg = cat.gwp < 0;
            return (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{cat.name}</span>
                <span className={isNeg ? 'text-emerald-400' : 'text-slate-300'}>
                  {isNeg ? '' : '+'}{(cat.gwp / 1000).toFixed(1)}t
                </span>
              </div>
            );
          })}
          <div className="pt-2 border-t border-slate-700 text-xs text-slate-500">
            kg CO₂e · Negative = carbon sink
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

