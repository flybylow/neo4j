'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { RiskItem } from '@/types/graph';

interface SupplyChainRiskProps {
  buildingId: string;
}

const SEVERITY_STYLES = {
  high: {
    border: 'border-l-red-500',
    bg: 'bg-red-950/30',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: '🔴',
  },
  medium: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-950/30',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: '🟡',
  },
  low: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-950/30',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: '🔵',
  },
};

const RISK_ICONS: Record<RiskItem['type'], string> = {
  single_source: '⚠️',
  expiring_cert: '📋',
  concentration: '🏭',
  geographic: '🌍',
};

export default function SupplyChainRisk({ buildingId }: SupplyChainRiskProps) {
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRisks() {
      try {
        setLoading(true);
        const response = await fetch(`/api/graph/risks/${buildingId}`);
        if (!response.ok) throw new Error('Failed to fetch risks');
        const data = await response.json();
        setRisks(data.risks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchRisks();
  }, [buildingId]);

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-red-400">Failed to load risk analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          Supply Chain Risk
        </CardTitle>
      </CardHeader>
      <CardContent>
        {risks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-emerald-400 font-medium">No significant risks detected</p>
            <p className="text-slate-500 text-sm mt-1">
              Supply chain appears healthy
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {risks.map((risk, index) => {
              const styles = SEVERITY_STYLES[risk.severity];
              const icon = RISK_ICONS[risk.type];

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${styles.border} ${styles.bg}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{icon}</span>
                      <h4 className="font-semibold text-white">{risk.title}</h4>
                    </div>
                    <Badge variant="outline" className={styles.badge}>
                      {risk.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{risk.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {risk.affectedProducts.slice(0, 5).map((product, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="bg-slate-800 text-slate-300 text-xs"
                      >
                        {product}
                      </Badge>
                    ))}
                    {risk.affectedProducts.length > 5 && (
                      <Badge
                        variant="secondary"
                        className="bg-slate-800 text-slate-400 text-xs"
                      >
                        +{risk.affectedProducts.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary footer */}
        {risks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">
                {risks.length} risk{risks.length !== 1 ? 's' : ''} identified
              </span>
              <div className="flex gap-2">
                {risks.filter((r) => r.severity === 'high').length > 0 && (
                  <span className="text-red-400">
                    {risks.filter((r) => r.severity === 'high').length} high
                  </span>
                )}
                {risks.filter((r) => r.severity === 'medium').length > 0 && (
                  <span className="text-amber-400">
                    {risks.filter((r) => r.severity === 'medium').length} medium
                  </span>
                )}
                {risks.filter((r) => r.severity === 'low').length > 0 && (
                  <span className="text-blue-400">
                    {risks.filter((r) => r.severity === 'low').length} low
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

