import BuildingExplorer from '@/components/graph/BuildingExplorer';
import SidebarPanel from '@/components/graph/SidebarPanel';
import Link from 'next/link';

interface BuildingPageProps {
  params: Promise<{ id: string }>;
}

export default async function BuildingPage({ params }: BuildingPageProps) {
  const { id } = await params;

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Compact Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur shrink-0">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
              ← Back
            </Link>
            <span className="text-slate-600">|</span>
            <h1 className="text-base font-semibold text-white">Building Explorer</h1>
          </div>
          <span className="text-xs text-slate-500 font-mono">{id}</span>
        </div>
      </header>

      {/* Main content - full screen graph with floating sidebar */}
      <main className="flex-1 relative overflow-hidden">
        {/* Graph - full width */}
        <div className="absolute inset-0">
          <BuildingExplorer buildingId={id} />
        </div>

        {/* Floating sidebar - left side with toggle */}
        <SidebarPanel buildingId={id} />
      </main>
    </div>
  );
}
