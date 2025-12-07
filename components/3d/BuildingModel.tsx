'use client';

import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Center, Html } from '@react-three/drei';
import * as THREE from 'three';

interface BuildingModelProps {
  onElementHover?: (element: string | null) => void;
  onElementClick?: (element: string) => void;
  highlightedElement?: string | null;
  showHotspots?: boolean;
}

// Map GLTF node names to building elements
const NODE_TO_ELEMENT: Record<string, string> = {
  'Main Building': 'Structure',
  'Pillar': 'Foundation',
  'Floor': 'Foundation',
  'Glass': 'Envelope',
  'Exterior': 'Envelope',
  'Windows Frame': 'Envelope',
  'Main Door': 'Envelope',
  'BackDoor': 'Envelope',
  'Cube': 'Systems',
  'Cube.001': 'Systems',
  'Cube.002': 'Systems',
};

// Element info for tooltips
const ELEMENT_INFO: Record<string, string> = {
  'Foundation': 'ECOPact Concrete + Recycled Steel Rebar',
  'Structure': 'CLT Wood Panels (Carbon Negative)',
  'Envelope': 'Glass Facade + Aluminum Frames + Rockwool Insulation',
  'Systems': 'Daikin VRV IV Heat Pump',
};

// Colors for highlighting
const HIGHLIGHT_COLORS: Record<string, string> = {
  'Foundation': '#3B82F6',
  'Structure': '#10B981',
  'Envelope': '#F59E0B',
  'Systems': '#8B5CF6',
};

// Hotspot positions for each element (in 3D space)
const HOTSPOT_POSITIONS: Record<string, [number, number, number]> = {
  'Foundation': [0, -0.8, 1.5],
  'Structure': [0, 0.5, 0],
  'Envelope': [1.5, 0.8, 0],
  'Systems': [0, 1.5, 0],
};

function Hotspot({ 
  position, 
  element, 
  isActive, 
  onClick 
}: { 
  position: [number, number, number]; 
  element: string; 
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Html position={position} center>
      <button
        onClick={onClick}
        className={`
          px-2 py-1 rounded-full text-xs font-medium
          transition-all duration-200 whitespace-nowrap
          border shadow-lg cursor-pointer
          ${isActive 
            ? 'bg-white text-slate-900 border-white scale-110' 
            : 'bg-slate-900/80 text-white border-slate-600 hover:bg-slate-800 hover:scale-105'
          }
        `}
        style={{ 
          backgroundColor: isActive ? HIGHLIGHT_COLORS[element] : undefined,
          borderColor: isActive ? HIGHLIGHT_COLORS[element] : undefined,
        }}
      >
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: HIGHLIGHT_COLORS[element] }} />
          {element}
        </span>
      </button>
    </Html>
  );
}

function GlassHausModel({ 
  onElementHover, 
  onElementClick, 
  highlightedElement,
  showHotspots = true,
}: BuildingModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/OfficeBuilding3.gltf');
  const [hovered, setHovered] = useState<string | null>(null);
  
  // Clone the scene to avoid mutation issues
  const clonedScene = scene.clone();
  
  // Slow auto-rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.4;
    }
  });

  // Apply highlighting to meshes
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const nodeName = child.name || child.parent?.name || '';
      const element = NODE_TO_ELEMENT[nodeName];
      
      if (element && (highlightedElement === element || hovered === element)) {
        // Create highlighted material
        const highlightColor = HIGHLIGHT_COLORS[element];
        if (child.material) {
          const mat = (child.material as THREE.MeshStandardMaterial).clone();
          mat.emissive = new THREE.Color(highlightColor);
          mat.emissiveIntensity = 0.3;
          child.material = mat;
        }
      }
    }
  });

  const handlePointerOver = (e: { stopPropagation: () => void; object: THREE.Object3D }) => {
    e.stopPropagation();
    const nodeName = e.object.name || e.object.parent?.name || '';
    const element = NODE_TO_ELEMENT[nodeName];
    if (element) {
      setHovered(element);
      onElementHover?.(element);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    setHovered(null);
    onElementHover?.(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: { stopPropagation: () => void; object: THREE.Object3D }) => {
    e.stopPropagation();
    const nodeName = e.object.name || e.object.parent?.name || '';
    const element = NODE_TO_ELEMENT[nodeName];
    if (element) {
      onElementClick?.(element);
    }
  };

  return (
    <group ref={groupRef}>
      <Center>
        <primitive 
          object={clonedScene} 
          scale={0.15}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
        
        {/* Hotspots */}
        {showHotspots && Object.entries(HOTSPOT_POSITIONS).map(([element, position]) => (
          <Hotspot
            key={element}
            position={position}
            element={element}
            isActive={highlightedElement === element || hovered === element}
            onClick={() => onElementClick?.(element)}
          />
        ))}
      </Center>
    </group>
  );
}

// Preload the model
useGLTF.preload('/OfficeBuilding3.gltf');

export default function BuildingModel({ 
  onElementHover, 
  onElementClick, 
  highlightedElement,
  showHotspots = true,
}: BuildingModelProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  
  const handleHover = (element: string | null) => {
    setHovered(element);
    onElementHover?.(element);
  };
  
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-slate-900 to-slate-950">
      <Canvas
        camera={{ position: [8, 5, 8], fov: 45 }}
        shadows
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, 10, -5]} intensity={0.3} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <GlassHausModel 
            onElementHover={handleHover}
            onElementClick={onElementClick}
            highlightedElement={highlightedElement || hovered}
            showHotspots={showHotspots}
          />
          
          <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.5} 
            scale={20} 
            blur={2.5} 
          />
          
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls 
          enablePan={false}
          minDistance={5}
          maxDistance={20}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={false}
        />
      </Canvas>
      
      {/* Hover tooltip */}
      {hovered && (
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-sm px-4 py-3 rounded-lg border border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: HIGHLIGHT_COLORS[hovered] }}
            />
            <p className="text-sm font-semibold text-white">{hovered}</p>
          </div>
          <p className="text-xs text-slate-400">{ELEMENT_INFO[hovered]}</p>
        </div>
      )}
      
      {/* Legend - only show in standalone mode */}
      {showHotspots && (
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Click hotspots to explore</p>
        </div>
      )}
    </div>
  );
}
