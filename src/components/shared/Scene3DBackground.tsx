// src/components/shared/Scene3DBackground.tsx
// Shared animated 3D canvas used as cinematic background (particle fog, floating runes, starfield).

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Preset = 'menu' | 'creation' | 'combat' | 'story' | 'dungeon';

interface Props {
  preset?: Preset;
  className?: string;
}

const PRESET_SETTINGS: Record<Preset, {
  bgColor: string;
  particleColor: string;
  particleColor2: string;
  fogColor: string;
  count: number;
  speed: number;
}> = {
  menu:     { bgColor: '#050403', particleColor: '#b79a65', particleColor2: '#e0c880', fogColor: '#1a1408', count: 200, speed: 0.3 },
  creation: { bgColor: '#060508', particleColor: '#8060c0', particleColor2: '#c0a0ff', fogColor: '#0c0814', count: 160, speed: 0.4 },
  combat:   { bgColor: '#080302', particleColor: '#c03030', particleColor2: '#ff8040', fogColor: '#1a0808', count: 120, speed: 0.8 },
  story:    { bgColor: '#050504', particleColor: '#a08860', particleColor2: '#d4b87a', fogColor: '#121008', count: 100, speed: 0.2 },
  dungeon:  { bgColor: '#030306', particleColor: '#4040a0', particleColor2: '#6060cc', fogColor: '#080810', count: 150, speed: 0.5 },
};

function FloatingParticles({ count, color1, color2, speed }: { count: number; color1: string; color2: string; speed: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const pos  = new Float32Array(count * 3);
    const col  = new Float32Array(count * 3);
    const sz   = new Float32Array(count);
    const c1   = new THREE.Color(color1);
    const c2   = new THREE.Color(color2);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 20;
      pos[i*3+1] = (Math.random() - 0.5) * 14;
      pos[i*3+2] = (Math.random() - 0.5) * 10 - 3;
      const mix  = Math.random();
      const c    = c1.clone().lerp(c2, mix);
      col[i*3]   = c.r;
      col[i*3+1] = c.g;
      col[i*3+2] = c.b;
      sz[i]      = Math.random() * 0.06 + 0.01;
    }
    return { positions: pos, colors: col, sizes: sz };
  }, [count, color1, color2]);

  const offsets = useMemo(() => Array.from({ length: count }, () => Math.random() * Math.PI * 2), [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const t   = state.clock.elapsedTime * speed;
    for (let i = 0; i < count; i++) {
      pos[i*3]   += Math.sin(t * 0.3 + offsets[i]) * 0.0015;
      pos[i*3+1] += Math.cos(t * 0.2 + offsets[i] * 1.3) * 0.001 + 0.0008 * speed;
      pos[i*3+2] += Math.sin(t * 0.4 + offsets[i] * 0.7) * 0.0005;
      if (pos[i*3+1] > 7)  pos[i*3+1] = -7;
      if (pos[i*3+1] < -7) pos[i*3+1] = 7;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]}    count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0.7} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function RotatingRune({ position, radius, speed }: { position: [number,number,number]; radius: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * speed;
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
      const s = 0.9 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      ref.current.scale.setScalar(s);
    }
  });
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#b79a65',
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  }), []);
  return (
    <mesh ref={ref} position={position} material={mat}>
      <torusGeometry args={[radius, 0.015, 8, 48]} />
    </mesh>
  );
}

function SceneContent({ preset }: { preset: Preset }) {
  const s = PRESET_SETTINGS[preset];
  return (
    <>
      <color attach="background" args={[s.bgColor]} />
      <ambientLight intensity={0.05} />
      <FloatingParticles count={s.count} color1={s.particleColor} color2={s.particleColor2} speed={s.speed} />
      <RotatingRune position={[-4, 1, -4]} radius={2.5} speed={0.08} />
      <RotatingRune position={[4, -1, -5]} radius={1.8} speed={-0.06} />
      <RotatingRune position={[0, 2, -6]}  radius={3.2} speed={0.04} />
      <RotatingRune position={[-2, -2, -3]} radius={1.2} speed={-0.1} />
    </>
  );
}

export function Scene3DBackground({ preset = 'menu', className = '' }: Props) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
        frameloop="always"
      >
        <SceneContent preset={preset} />
      </Canvas>
    </div>
  );
}
