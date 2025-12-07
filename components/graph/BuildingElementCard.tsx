'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Product {
  name: string;
  manufacturer: string;
  gwp: number;
  gwpUnit: string;
  quantity: number;
  quantityUnit: string;
  recycledContent?: number;
  epdNumber?: string;
  certifications?: string[];
  note?: string;
  energyRating?: string;
}

interface BuildingElement {
  id: string;
  name: string;
  carbon: number;
  carbonUnit: string;
  products: Product[];
  certifications: number;
}

interface BuildingElementCardProps {
  element: string;
  onClose?: () => void;
  onViewInGraph?: () => void;
}

// Building element data
const ELEMENT_DATA: Record<string, BuildingElement> = {
  Foundation: {
    id: 'element-foundation',
    name: 'Foundation',
    carbon: 167.4,
    carbonUnit: 't',
    certifications: 2,
    products: [
      {
        name: 'ECOPact Concrete C30/37',
        manufacturer: 'Holcim Belgium',
        gwp: 285,
        gwpUnit: 'kg/m³',
        quantity: 450,
        quantityUnit: 'm³',
        recycledContent: 15,
        epdNumber: 'EPD-HOL-2024-001',
      },
      {
        name: 'Recycled Steel Rebar B500B',
        manufacturer: 'ArcelorMittal',
        gwp: 0.87,
        gwpUnit: 'kg/kg',
        quantity: 45000,
        quantityUnit: 'kg',
        recycledContent: 95,
        epdNumber: 'EPD-ARC-2024-001',
      },
    ],
  },
  Structure: {
    id: 'element-structure',
    name: 'Structure',
    carbon: -201.0,
    carbonUnit: 't',
    certifications: 2,
    products: [
      {
        name: 'CLT Panel 120mm',
        manufacturer: 'Stora Enso',
        gwp: -718,
        gwpUnit: 'kg/m³',
        quantity: 280,
        quantityUnit: 'm³',
        recycledContent: 0,
        epdNumber: 'EPD-STO-2024-001',
        certifications: ['EPD', 'FSC-COC'],
        note: 'Carbon-negative — wood sequesters CO₂',
      },
    ],
  },
  Envelope: {
    id: 'element-envelope',
    name: 'Envelope',
    carbon: 33.9,
    carbonUnit: 't',
    certifications: 3,
    products: [
      {
        name: 'Rockwool FlexiBatts 037',
        manufacturer: 'Rockwool',
        gwp: 1.2,
        gwpUnit: 'kg/m²',
        quantity: 2800,
        quantityUnit: 'm²',
        recycledContent: 25,
        epdNumber: 'EPD-ROC-2024-001',
      },
      {
        name: 'AGC Planibel Clearvision',
        manufacturer: 'AGC Belgium',
        gwp: 12.5,
        gwpUnit: 'kg/m²',
        quantity: 1200,
        quantityUnit: 'm²',
        recycledContent: 30,
        epdNumber: 'EPD-AGC-2024-001',
      },
      {
        name: 'Reynaers CS 77 Frames',
        manufacturer: 'Reynaers Aluminium',
        gwp: 18.3,
        gwpUnit: 'kg/m',
        quantity: 850,
        quantityUnit: 'm',
        recycledContent: 45,
        epdNumber: 'EPD-REY-2024-001',
      },
    ],
  },
  Systems: {
    id: 'element-systems',
    name: 'Systems',
    carbon: 9.8,
    carbonUnit: 't',
    certifications: 1,
    products: [
      {
        name: 'Daikin VRV IV Heat Pump',
        manufacturer: 'Daikin Europe',
        gwp: 2450,
        gwpUnit: 'kg/unit',
        quantity: 4,
        quantityUnit: 'units',
        energyRating: 'A+++',
        epdNumber: 'EPD-DAI-2024-001',
      },
    ],
  },
};

// Element color mapping
const ELEMENT_COLORS: Record<string, string> = {
  Foundation: '#3B82F6',
  Structure: '#10B981',
  Envelope: '#F59E0B',
  Systems: '#8B5CF6',
};

export default function BuildingElementCard({
  element,
  onClose,
  onViewInGraph,
}: BuildingElementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const data = ELEMENT_DATA[element];

  if (!data) return null;

  const isNegative = data.carbon < 0;
  const color = ELEMENT_COLORS[element];

  // Collapsed view - just the header
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden min-w-[200px] shadow-2xl hover:bg-slate-800/95 transition-colors cursor-pointer"
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="font-semibold text-white">{data.name}</span>
          </div>
          <div className={`font-bold ${isNegative ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isNegative ? '' : '+'}{data.carbon}{data.carbonUnit}
          </div>
        </div>
      </button>
    );
  }

  // Expanded view - full card
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden min-w-[300px] max-w-[360px] shadow-2xl">
      {/* Header */}
      <div 
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
        style={{ borderBottom: `2px solid ${color}` }}
        onClick={() => setIsExpanded(false)}
      >
        <div className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <span className="font-semibold text-white text-lg">{data.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`font-bold text-lg ${isNegative ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isNegative ? '' : '+'}{data.carbon}{data.carbonUnit}
          </div>
          {onClose && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Carbon indicator */}
      {isNegative && (
        <div className="px-4 py-2 bg-emerald-950/50 border-b border-emerald-900/50">
          <p className="text-emerald-400 text-sm flex items-center gap-1">
            <span>↓</span> Carbon sequestration — this element stores CO₂
          </p>
        </div>
      )}

      {/* Products */}
      <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto scrollbar-dark">
        {data.products.map((product, i) => (
          <div 
            key={i} 
            className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="text-white font-medium">{product.name}</div>
              <Badge 
                variant="outline" 
                className={`text-xs ${product.gwp < 0 ? 'text-emerald-400 border-emerald-600' : 'text-slate-400 border-slate-600'}`}
              >
                {product.gwp > 0 ? '+' : ''}{product.gwp} {product.gwpUnit}
              </Badge>
            </div>
            <div className="text-slate-400 text-sm mb-2">
              {product.manufacturer} · {product.quantity.toLocaleString()} {product.quantityUnit}
            </div>
            
            {/* Certifications & Details */}
            <div className="flex flex-wrap gap-1.5">
              {product.epdNumber && (
                <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-700 text-xs">
                  ✓ EPD
                </Badge>
              )}
              {product.certifications?.filter(cert => cert !== 'EPD').map((cert, j) => (
                <Badge key={j} className="bg-emerald-900/50 text-emerald-400 border-emerald-700 text-xs">
                  ✓ {cert}
                </Badge>
              ))}
              {product.recycledContent !== undefined && product.recycledContent > 0 && (
                <Badge className="bg-blue-900/50 text-blue-400 border-blue-700 text-xs">
                  ♻ {product.recycledContent}% recycled
                </Badge>
              )}
              {product.energyRating && (
                <Badge className="bg-purple-900/50 text-purple-400 border-purple-700 text-xs">
                  ⚡ {product.energyRating}
                </Badge>
              )}
            </div>
            
            {product.note && (
              <p className="text-xs text-emerald-300/80 mt-2 italic">{product.note}</p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between bg-slate-800/30">
        <div className="text-xs text-slate-400">
          {data.certifications} EPD{data.certifications !== 1 ? 's' : ''} verified
        </div>
        {onViewInGraph && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewInGraph}
            className="text-blue-400 hover:text-blue-300 text-xs"
          >
            View in Graph →
          </Button>
        )}
      </div>
    </div>
  );
}

