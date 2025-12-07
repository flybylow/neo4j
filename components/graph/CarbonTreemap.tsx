'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CarbonBreakdown } from '@/types/graph';

interface CarbonTreemapProps {
  buildingId: string;
}

// Color mapping for categories
const CATEGORY_COLORS: Record<string, string> = {
  Foundation: '#3B82F6',
  Structure: '#10B981',
  Envelope: '#F59E0B',
  Systems: '#8B5CF6',
  Default: '#6B7280',
};

export default function CarbonTreemap({ buildingId }: CarbonTreemapProps) {
  const [data, setData] = useState<CarbonBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCarbon() {
      try {
        setLoading(true);
        const response = await fetch(`/api/graph/carbon/${buildingId}`);
        if (!response.ok) throw new Error('Failed to fetch carbon data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchCarbon();
  }, [buildingId]);

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-red-400">Failed to load carbon data</p>
        </CardContent>
      </Card>
    );
  }

  // Determine if building is carbon negative (CLT buildings can be!)
  const isNegative = data.gwp < 0;

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          Embodied Carbon
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Total GWP */}
        <div className="mb-6">
          <div className={`text-4xl font-bold ${isNegative ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isNegative ? '' : '+'}{data.gwp.toLocaleString()}
          </div>
          <p className="text-slate-400 text-sm">
            kg CO₂e Total Global Warming Potential
          </p>
          {isNegative && (
            <p className="text-emerald-400 text-sm mt-1">
              ✓ This building is carbon negative!
            </p>
          )}
        </div>

        {/* Category breakdown */}
        <div className="space-y-4">
          {data.children?.map((category) => {
            const color = CATEGORY_COLORS[category.name] || CATEGORY_COLORS.Default;
            const isNegativeCategory = category.gwp < 0;
            
            return (
              <div key={category.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300 font-medium">{category.name}</span>
                  <span className="text-slate-400">
                    {isNegativeCategory ? '' : '+'}{category.gwp.toLocaleString()} kg CO₂e
                  </span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.abs(category.percentage)}%`,
                      backgroundColor: isNegativeCategory ? '#10B981' : color,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-slate-500">
                    {Math.abs(category.percentage).toFixed(1)}% of total
                  </span>
                  {isNegativeCategory && (
                    <span className="text-emerald-500">Carbon sink</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info footer */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            GWP calculated from EPD data. Negative values indicate carbon sequestration (e.g., CLT wood products).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

