import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-slate-950 to-blue-950/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Construction DPP Demo
            </Badge>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
              Glass Haus
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Explore the supply chain and environmental impact of a modern office building 
              through an interactive knowledge graph. Powered by Neo4j and real EPD data.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/building/building-001">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Explore Building Graph →
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Multi-Stakeholder Views</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon="👤"
            title="Consumer"
            description="See products, certifications, and manufacturers. Understand what's in your building."
            color="blue"
          />
          <FeatureCard
            icon="🏭"
            title="Manufacturer"
            description="Track supply chains, plants, and materials. Full production traceability."
            color="purple"
          />
          <FeatureCard
            icon="♻️"
            title="Recycler"
            description="View material composition and recyclability. Plan end-of-life processing."
            color="emerald"
          />
          <FeatureCard
            icon="📋"
            title="Regulator"
            description="Complete compliance view. Verify certifications and audit trails."
            color="amber"
          />
        </div>
      </div>

      {/* Analytics Preview */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span>🌱</span> Carbon Analysis
              </CardTitle>
              <CardDescription>
                Track embodied carbon across building elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnalyticsBar label="Foundation" percentage={45} color="#3B82F6" />
                <AnalyticsBar label="Structure" percentage={30} color="#10B981" negative />
                <AnalyticsBar label="Envelope" percentage={15} color="#F59E0B" />
                <AnalyticsBar label="Systems" percentage={10} color="#8B5CF6" />
              </div>
              <p className="text-xs text-slate-500 mt-4">
                * Negative values indicate carbon sequestration (e.g., CLT panels)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span>🛡️</span> Risk Intelligence
              </CardTitle>
              <CardDescription>
                Supply chain risk analysis and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <RiskItem severity="medium" title="Single Supplier Risk" count={3} />
                <RiskItem severity="low" title="Expiring Certifications" count={1} />
                <RiskItem severity="low" title="Geographic Concentration" count={2} />
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Real-time monitoring of supply chain vulnerabilities
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="container mx-auto px-4 py-16 border-t border-slate-800">
        <h2 className="text-xl font-semibold mb-6 text-center text-slate-400">Built With</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <TechBadge>Neo4j AuraDB</TechBadge>
          <TechBadge>NVL Graph Viz</TechBadge>
          <TechBadge>Next.js 14</TechBadge>
          <TechBadge>TypeScript</TechBadge>
          <TechBadge>Tailwind CSS</TechBadge>
          <TechBadge>EC3 EPD Data</TechBadge>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Tabulas DPP Demo · Construction Digital Product Passport</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-transparent border-blue-500/30',
    purple: 'from-purple-500/20 to-transparent border-purple-500/30',
    emerald: 'from-emerald-500/20 to-transparent border-emerald-500/30',
    amber: 'from-amber-500/20 to-transparent border-amber-500/30',
  };

  return (
    <Card className={`bg-gradient-to-b ${colorClasses[color]} border bg-slate-900/50`}>
      <CardHeader>
        <div className="text-3xl mb-2">{icon}</div>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

function AnalyticsBar({
  label,
  percentage,
  color,
  negative = false,
}: {
  label: string;
  percentage: number;
  color: string;
  negative?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{negative ? '-' : ''}{percentage}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function RiskItem({
  severity,
  title,
  count,
}: {
  severity: 'high' | 'medium' | 'low';
  title: string;
  count: number;
}) {
  const colors = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-amber-500/20 text-amber-400',
    low: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
      <span className="text-slate-300 text-sm">{title}</span>
      <Badge className={colors[severity]}>{count} items</Badge>
    </div>
  );
}

function TechBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">
      {children}
    </span>
  );
}
