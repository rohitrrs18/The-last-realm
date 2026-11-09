// src/components/world/WorldMap.tsx
// Colorful, vibrant world atlas and 3D globe with rich biome landscapes,
// illuminated settlement beacons, glowing roads, danger indicators, and route travel.

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense } from 'react';
import { useGame } from '../../state/gameStore';
import { Compass, MapPin, ChevronRight, Eye, ShieldAlert, Sparkles, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Location } from '../../types/game';
import { sfx } from '../../audio/sfx';

/* ---- Danger level colors ---- */
const DANGER_CONFIGS: Record<string, { color: string; bg: string; border: string }> = {
  Low:      { color: '#10b981', bg: 'rgba(16,185,129,0.18)', border: '#10b981' },
  Moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.18)', border: '#f59e0b' },
  High:     { color: '#f97316', bg: 'rgba(249,115,22,0.18)', border: '#f97316' },
  Deadly:   { color: '#ef4444', bg: 'rgba(239,68,68,0.22)', border: '#ef4444' },
};

const BIOME_THEMES: Record<string, { color: string; glow: string; bg: string; icon: string; name: string }> = {
  village:  { color: '#f59e0b', glow: '#fbbf24', bg: '#291804', icon: '🏘️', name: 'Settlement' },
  forest:   { color: '#10b981', glow: '#34d399', bg: '#042416', icon: '🌲', name: 'Verdant Forest' },
  ruins:    { color: '#a855f7', glow: '#c084fc', bg: '#230a38', icon: '🏛️', name: 'Ancient Ruins' },
  cave:     { color: '#6366f1', glow: '#818cf8', bg: '#101238', icon: '🕳️', name: 'Caverns' },
  mountain: { color: '#38bdf8', glow: '#7dd3fc', bg: '#082538', icon: '⛰️', name: 'Peaks' },
  dungeon:  { color: '#ef4444', glow: '#f87171', bg: '#360909', icon: '💀', name: 'Catacombs' },
  castle:   { color: '#eab308', glow: '#fde047', bg: '#2b2304', icon: '🏰', name: 'Royal Stronghold' },
  lake:     { color: '#06b6d4', glow: '#22d3ee', bg: '#04242e', icon: '🌊', name: 'Sapphire Lake' },
};

/* ========================================================
   VIBRANT 3D TERRAIN MESH
   ======================================================== */
function ColorfulTerrainMesh({ seed }: { seed: number }) {
  const { positions, colors, geometry } = useMemo(() => {
    const W = 46, H = 46;
    const geo = new THREE.PlaneGeometry(12, 12, W - 1, H - 1);
    const pos = geo.attributes.position.array as Float32Array;
    const col = new Float32Array(pos.length);

    for (let i = 0; i < W * H; i++) {
      const x = pos[i * 3];
      const z = pos[i * 3 + 1];
      const n =
        Math.sin(x * 1.2 + seed * 0.001) * Math.cos(z * 1.1 + seed * 0.0007) * 0.8 +
        Math.sin(x * 2.2 + z * 1.6) * 0.35 +
        Math.sin(x * 0.7 + seed * 0.002 + z * 1.9) * 0.45;

      pos[i * 3 + 2] = n;

      // Vivid colorful elevation grading
      const h = (n + 1.2) / 2.4; // 0 to 1
      if (h < 0.28) {
        // Vibrant Deep Water
        col[i * 3] = 0.05;
        col[i * 3 + 1] = 0.45;
        col[i * 3 + 2] = 0.85;
      } else if (h < 0.35) {
        // Golden Sandy Shore
        col[i * 3] = 0.85;
        col[i * 3 + 1] = 0.72;
        col[i * 3 + 2] = 0.35;
      } else if (h < 0.58) {
        // Lush Emerald Green Forest
        col[i * 3] = 0.12;
        col[i * 3 + 1] = 0.68;
        col[i * 3 + 2] = 0.28;
      } else if (h < 0.78) {
        // Highland Amber / Autumn Plateau
        col[i * 3] = 0.75;
        col[i * 3 + 1] = 0.52;
        col[i * 3 + 2] = 0.18;
      } else {
        // Snowy / Granite Peaks
        col[i * 3] = 0.92;
        col[i * 3 + 1] = 0.94;
        col[i * 3 + 2] = 0.98;
      }
    }

    geo.computeVertexNormals();
    return { positions: pos, colors: col, geometry: geo };
  }, [seed]);

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.75,
        metalness: 0.1,
      }),
    []
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geometry} material={mat} receiveShadow />
  );
}

/* ---- Colorful 3D Location Marker ---- */
function LocationBeacon3D({
  loc,
  isCurrent,
  onClick,
}: {
  loc: Location;
  isCurrent: boolean;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const wx = (loc.x / 100 - 0.5) * 11;
  const wz = (loc.y / 100 - 0.5) * 11;
  const biomeTheme = BIOME_THEMES[loc.type] || BIOME_THEMES.village;
  const color = isCurrent ? '#FFD700' : biomeTheme.color;

  useFrame((state) => {
    if (!ref.current) return;
    if (isCurrent) {
      ref.current.position.y = 0.55 + Math.sin(state.clock.elapsedTime * 2.5) * 0.1;
    }
    if (ringRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
      ringRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={ref} position={[wx, 0.45, wz]} onClick={onClick}>
      {/* Light Pillar */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {/* Top Floating Jewel */}
      <mesh position={[0, 0.85, 0]}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
      {/* Radiant Ground Glow Ring */}
      <mesh ref={ringRef} position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.4, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color={color} intensity={isCurrent ? 2.5 : 1.2} distance={2.5} />
    </group>
  );
}

/* ========================================================
   MASTER WORLD MAP COMPONENT
   ======================================================== */
export function WorldMap() {
  const world = useGame((s) => s.world);
  const travel = useGame((s) => s.travelTo);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'atlas' | 'globe'>('atlas');

  if (!world) return null;

  const currentLoc = world.locations.find((l) => l.id === world.currentLocationId);
  const selectedLoc = world.locations.find((l) => l.id === selectedId) || currentLoc;
  const discovered = world.locations.filter((l) => l.discovered);

  const handleTravel = (id: string) => {
    sfx.play('ui-open');
    travel(id);
    setSelectedId(id);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none bg-[#090704]">
      {/* Top Navigation Header */}
      <div className="px-5 py-3.5 border-b border-gold/15 bg-black/60 backdrop-blur-md flex items-center justify-between z-20">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold">
            The Last Realm · Continental Cartography
          </div>
          <h1 className="h-cinzel text-xl md:text-2xl font-bold text-ink">{world.kingdomName}</h1>
        </div>

        {/* Mode Toggle (Colorful Atlas vs 3D Realm Globe) */}
        <div className="flex items-center gap-2">
          <div className="bg-black/60 p-1 rounded-sm border border-gold/20 flex gap-1">
            <button
              onClick={() => {
                setMapMode('atlas');
                sfx.play('ui-click');
              }}
              className={`px-3 py-1 rounded-sm text-xs font-bold transition-all ${
                mapMode === 'atlas' ? 'bg-gold text-black shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              Colorful 2D Atlas
            </button>
            <button
              onClick={() => {
                setMapMode('globe');
                sfx.play('ui-click');
              }}
              className={`px-3 py-1 rounded-sm text-xs font-bold transition-all ${
                mapMode === 'globe' ? 'bg-gold text-black shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              3D Terrain Globe
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* CENTER: THE MAP VIEWPORT */}
        <div className="flex-1 relative overflow-hidden bg-[#070b12] flex items-center justify-center">
          
          {/* MODE 1: COLORFUL 2D REALM ATLAS */}
          {mapMode === 'atlas' ? (
            <div className="relative w-full h-full p-4 md:p-8 flex items-center justify-center overflow-auto">
              <div
                className="relative w-full max-w-4xl aspect-[16/10] rounded-sm border-2 border-gold/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
                style={{
                  background: 'radial-gradient(ellipse at 50% 50%, #172a3a 0%, #0c1824 50%, #050a10 100%)',
                }}
              >
                {/* Ancient Parchment Grid & Waves */}
                <div className="absolute inset-0 bg-noise opacity-15 pointer-events-none" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Connecting Colorful Roads between Settlements */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {world.locations.map((loc, idx) => {
                    const next = world.locations[(idx + 1) % world.locations.length];
                    return (
                      <line
                        key={`road-${loc.id}-${next.id}`}
                        x1={`${loc.x}%`}
                        y1={`${loc.y}%`}
                        x2={`${next.x}%`}
                        y2={`${next.y}%`}
                        stroke="rgba(245, 158, 11, 0.35)"
                        strokeWidth="2.5"
                        strokeDasharray="6,4"
                      />
                    );
                  })}
                </svg>

                {/* Interactive Location Beacons */}
                {world.locations.map((loc) => {
                  const isCurrent = loc.id === world.currentLocationId;
                  const isSelected = selectedLoc?.id === loc.id;
                  const theme = BIOME_THEMES[loc.type] || BIOME_THEMES.village;
                  const danger = DANGER_CONFIGS[loc.dangerLevel] || DANGER_CONFIGS.Low;

                  return (
                    <motion.div
                      key={loc.id}
                      style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                      whileHover={{ scale: 1.15 }}
                      onClick={() => {
                        sfx.play('ui-click');
                        setSelectedId(loc.id);
                      }}
                    >
                      {/* Pulse Ring for Current Location */}
                      {isCurrent && (
                        <span className="absolute -inset-3 rounded-full animate-ping bg-amber-400/40 pointer-events-none" />
                      )}

                      {/* Beacon Marker Card */}
                      <div
                        className={`p-2 rounded-full border-2 shadow-2xl flex items-center justify-center transition-all ${
                          isSelected ? 'ring-4 ring-gold scale-110' : ''
                        }`}
                        style={{
                          background: theme.bg,
                          borderColor: isCurrent ? '#FFD700' : theme.color,
                          boxShadow: `0 0 20px ${theme.glow}80`,
                        }}
                      >
                        <span className="text-lg leading-none">{theme.icon}</span>
                      </div>

                      {/* Location Name Tag */}
                      <div
                        className="mt-1 px-2.5 py-0.5 rounded-sm text-[10px] font-bold whitespace-nowrap text-center shadow-lg border"
                        style={{
                          background: 'rgba(5,7,10,0.92)',
                          borderColor: isCurrent ? '#FFD700' : `${theme.color}70`,
                          color: isCurrent ? '#FFD700' : '#fff',
                        }}
                      >
                        {isCurrent && '📍 '}
                        {loc.name}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* MODE 2: 3D TERRAIN GLOBE */
            <div className="w-full h-full relative">
              <Canvas camera={{ position: [0, 8, 8], fov: 48 }} shadows gl={{ antialias: true }}>
                <color attach="background" args={['#060c16']} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[6, 9, 5]} intensity={1.5} color="#fff6e8" castShadow />
                <pointLight position={[0, 8, 0]} intensity={1.0} color="#66aaff" />

                <Suspense fallback={null}>
                  <ColorfulTerrainMesh seed={world.seed} />
                  {world.locations.map((loc) => (
                    <LocationBeacon3D
                      key={loc.id}
                      loc={loc}
                      isCurrent={loc.id === world.currentLocationId}
                      onClick={() => {
                        sfx.play('ui-click');
                        setSelectedId(loc.id);
                      }}
                    />
                  ))}
                </Suspense>

                <OrbitControls
                  enablePan={false}
                  minPolarAngle={Math.PI * 0.2}
                  maxPolarAngle={Math.PI * 0.52}
                  minDistance={5}
                  maxDistance={15}
                  autoRotate
                  autoRotateSpeed={0.4}
                />
              </Canvas>
            </div>
          )}
        </div>

        {/* RIGHT DRAWER: Selected Location Dossier & Fast Travel Action */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gold/15 bg-panel/95 backdrop-blur-md p-5 flex flex-col justify-between space-y-4 z-20">
          {selectedLoc ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm border"
                    style={{
                      color: DANGER_CONFIGS[selectedLoc.dangerLevel]?.color,
                      borderColor: DANGER_CONFIGS[selectedLoc.dangerLevel]?.border,
                      background: DANGER_CONFIGS[selectedLoc.dangerLevel]?.bg,
                    }}
                  >
                    {selectedLoc.dangerLevel} Threat
                  </span>
                  {selectedLoc.id === world.currentLocationId && (
                    <span className="text-[10px] text-gold font-bold flex items-center gap-1">
                      <MapPin size={12} /> Current Position
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 mt-2">
                  <span className="text-3xl">{BIOME_THEMES[selectedLoc.type]?.icon || '📍'}</span>
                  <div>
                    <h2 className="h-serif text-xl font-bold text-ink">{selectedLoc.name}</h2>
                    <div className="text-xs text-gold">{selectedLoc.region} · {BIOME_THEMES[selectedLoc.type]?.name}</div>
                  </div>
                </div>
              </div>

              {/* Territory Narrative Description */}
              <div className="p-3.5 rounded-sm bg-black/50 border border-gold/15 space-y-2">
                <div className="text-[10px] uppercase font-bold text-muted">Territory Lore</div>
                <p className="text-xs text-ink2 italic leading-relaxed">
                  "{selectedLoc.description}"
                </p>
              </div>

              {/* Inhabitants & Threat Status */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted">Regional Biome:</span>
                  <span className="font-semibold text-ink capitalize">{selectedLoc.type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted">Exploration Status:</span>
                  <span className="text-emerald-400 font-bold">Discovered & Mapped</span>
                </div>
              </div>

              {/* Fast Travel Button */}
              {selectedLoc.id !== world.currentLocationId ? (
                <button
                  onClick={() => handleTravel(selectedLoc.id)}
                  className="w-full py-3.5 rounded-sm font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black shadow-lg transition-transform active:scale-[0.99]"
                >
                  <Navigation size={14} />
                  <span>Embark & Fast Travel</span>
                </button>
              ) : (
                <div className="p-3 rounded-sm text-center text-xs text-gold/80 bg-gold/10 border border-gold/30 font-semibold">
                  You are currently camped at this location.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-muted italic text-xs">
              Select a location beacon from the map to inspect terrain and travel routes.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
