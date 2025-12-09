'use client';

import { useRef, useState, Suspense, useMemo, useEffect } from 'react';
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
  'Foundation': [2, -0.5, 2],
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
          px-2.5 py-1.5 rounded-full text-xs font-medium
          transition-all duration-300 whitespace-nowrap
          border shadow-lg cursor-pointer
          ${isActive 
            ? 'scale-110 text-white border-cyan-400 animate-pulse' 
            : 'bg-slate-900/80 text-white border-slate-600 hover:bg-slate-800 hover:scale-105 hover:border-slate-500'
          }
        `}
        style={{ 
          backgroundColor: isActive ? 'rgba(0, 217, 255, 0.9)' : undefined,
          boxShadow: isActive ? '0 0 20px rgba(0, 217, 255, 0.5), 0 0 40px rgba(0, 217, 255, 0.2)' : undefined,
        }}
      >
        <span className="flex items-center gap-1.5">
          <span 
            className={`w-2 h-2 rounded-full ${isActive ? 'animate-ping' : ''}`} 
            style={{ 
              backgroundColor: isActive ? '#fff' : HIGHLIGHT_COLORS[element],
            }} 
          />
          {!isActive && <span className="w-2 h-2 rounded-full absolute" style={{ backgroundColor: HIGHLIGHT_COLORS[element] }} />}
          {element}
        </span>
      </button>
    </Html>
  );
}

interface MeshData {
  mesh: THREE.Mesh;
  element: string;
  originalMaterial: THREE.Material;
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
  const meshDataRef = useRef<MeshData[]>([]);
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(false);
  
  // Delay hover detection to prevent immediate triggering on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      isMountedRef.current = true;
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Clone the scene once
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    return clone;
  }, [scene]);
  
  // Initialize mesh data (only once)
  useMemo(() => {
    if (isInitializedRef.current) return;
    
    meshDataRef.current = [];
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const nodeName = child.name || child.parent?.name || '';
        const element = NODE_TO_ELEMENT[nodeName];
        
        if (element && child.material) {
          meshDataRef.current.push({
            mesh: child,
            element,
            originalMaterial: child.material,
          });
        }
      }
    });
    
    isInitializedRef.current = true;
  }, [clonedScene]);
  
  // Animated pulse effect + material updates
  useFrame((state) => {
    // Slow auto-rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.4;
    }
    
    // Pulse value
    const pulse = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2;
    
    // Update materials based on highlight state
    meshDataRef.current.forEach(({ mesh, element, originalMaterial }) => {
      const isHighlighted = element === highlightedElement || element === hovered;
      
      if (isHighlighted) {
        // Apply highlight material
        if (mesh.material === originalMaterial || !(mesh.material as THREE.MeshStandardMaterial).emissive) {
          const highlightMat = (originalMaterial as THREE.MeshStandardMaterial).clone();
          highlightMat.emissive = new THREE.Color('#00D9FF');
          highlightMat.transparent = true;
          highlightMat.opacity = 0.95;
          mesh.material = highlightMat;
        }
        // Animate emissive intensity
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + pulse * 0.4;
      } else {
        // Restore original material
        if (mesh.material !== originalMaterial) {
          mesh.material = originalMaterial;
        }
      }
    });
  });

  const handlePointerOver = (e: { stopPropagation: () => void; object: THREE.Object3D }) => {
    e.stopPropagation();
    // Don't process hover events until component is fully mounted
    if (!isMountedRef.current) return;
    
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
          
          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial 
              color="#1a1a2e" 
              transparent 
              opacity={0.8}
              metalness={0.2}
              roughness={0.8}
            />
          </mesh>
          
          {/* Grid helper for visual reference */}
          <gridHelper args={[20, 20, '#2a2a4a', '#1a1a3a']} position={[0, -1.49, 0]} />
          
          <ContactShadows 
            position={[0, -1.48, 0]} 
            opacity={0.6} 
            scale={15} 
            blur={2} 
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
        <div 
          className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-sm px-4 py-3 rounded-lg border border-cyan-500/50 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ boxShadow: '0 0 20px rgba(0, 217, 255, 0.15)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="w-3 h-3 rounded-full animate-pulse" 
              style={{ backgroundColor: '#00D9FF' }}
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
