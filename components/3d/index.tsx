'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
export const BuildingModel = dynamic(() => import('./BuildingModel'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Loading 3D Model...</p>
      </div>
    </div>
  ),
});

