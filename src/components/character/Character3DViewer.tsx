// src/components/character/Character3DViewer.tsx
// High-fidelity procedural 3D fantasy champions built with Three.js geometry.
// Realistic materials, articulated knight plate, wizard robes, assassin cloaks,
// glowing runic weapons, dynamic idle breathing, particles, and dramatic lighting.

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Float } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import type { ClassName } from '../../types/game';

interface Props {
  className?: ClassName | string;
  size?: 'sm' | 'md' | 'lg' | 'mini';
  showOrbit?: boolean;
  mini?: boolean;
}

const CLASS_THEMES: Record<string, { primary: string; secondary: string; accent: string }> = {
  Warrior: { primary: '#6e5436', secondary: '#c99a42', accent: '#ff8800' },
  Mage:    { primary: '#1c2e6b', secondary: '#5688e8', accent: '#6ea8ff' },
  Rogue:   { primary: '#28173d', secondary: '#8a4ecc', accent: '#b57aff' },
  Ranger:  { primary: '#1f4724', secondary: '#4ea85c', accent: '#72e084' },
};

/* ======================================================
   WARRIOR — Detailed Gothic Plate Knight
   ====================================================== */
function WarriorModel() {
  const group = useRef<THREE.Group>(null);
  const swordRef = useRef<THREE.Group>(null);
  const capeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      // Idle breathing and slight stance sway
      group.current.position.y = -1.35 + Math.sin(t * 1.5) * 0.025;
      group.current.rotation.y = Math.sin(t * 0.4) * 0.12;
    }
    if (swordRef.current) {
      swordRef.current.rotation.z = -0.45 + Math.sin(t * 1.5) * 0.03;
    }
    if (capeRef.current) {
      capeRef.current.rotation.x = 0.2 + Math.sin(t * 2.2) * 0.05;
    }
  });

  const steelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5a6268', metalness: 0.88, roughness: 0.28 }), []);
  const darkSteel = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2b3035', metalness: 0.9, roughness: 0.35 }), []);
  const goldTrim = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.95, roughness: 0.2, emissive: '#aa8010', emissiveIntensity: 0.25 }), []);
  const redFabric = useMemo(() => new THREE.MeshStandardMaterial({ color: '#881818', roughness: 0.75, metalness: 0.1 }), []);
  const glowRune = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffaa33', emissive: '#ff7700', emissiveIntensity: 0.9 }), []);

  return (
    <group ref={group} position={[0, -1.35, 0]}>
      {/* Sabatons (Boots) */}
      <mesh position={[-0.2, 0.08, 0.06]} material={steelMat}><boxGeometry args={[0.22, 0.15, 0.36]} /></mesh>
      <mesh position={[0.2, 0.08, 0.06]} material={steelMat}><boxGeometry args={[0.22, 0.15, 0.36]} /></mesh>
      <mesh position={[-0.2, 0.16, 0.08]} material={goldTrim}><boxGeometry args={[0.24, 0.03, 0.34]} /></mesh>
      <mesh position={[0.2, 0.16, 0.08]} material={goldTrim}><boxGeometry args={[0.24, 0.03, 0.34]} /></mesh>

      {/* Greaves (Legs) */}
      <mesh position={[-0.2, 0.52, 0]} material={steelMat}><cylinderGeometry args={[0.13, 0.11, 0.75, 12]} /></mesh>
      <mesh position={[0.2, 0.52, 0]} material={steelMat}><cylinderGeometry args={[0.13, 0.11, 0.75, 12]} /></mesh>
      {/* Knee Cops */}
      <mesh position={[-0.2, 0.86, 0.1]} material={goldTrim}><sphereGeometry args={[0.08, 8, 8]} /></mesh>
      <mesh position={[0.2, 0.86, 0.1]} material={goldTrim}><sphereGeometry args={[0.08, 8, 8]} /></mesh>

      {/* Cuisses & Tassets (Thigh Armor & Chainmail) */}
      <mesh position={[0, 1.05, 0]} material={darkSteel}><cylinderGeometry args={[0.3, 0.33, 0.35, 12]} /></mesh>
      <mesh position={[-0.22, 1.05, 0.18]} rotation={[0.1, 0, 0.15]} material={steelMat}><boxGeometry args={[0.18, 0.32, 0.04]} /></mesh>
      <mesh position={[0.22, 1.05, 0.18]} rotation={[0.1, 0, -0.15]} material={steelMat}><boxGeometry args={[0.18, 0.32, 0.04]} /></mesh>

      {/* Torso / Curass (Breastplate with filigree) */}
      <mesh position={[0, 1.45, 0]} material={steelMat}><boxGeometry args={[0.62, 0.65, 0.38]} /></mesh>
      {/* Breastplate Central Ridge & Gold Heraldic Emblem */}
      <mesh position={[0, 1.5, 0.2]} material={goldTrim}><cylinderGeometry args={[0.02, 0.05, 0.5, 6]} /></mesh>
      <mesh position={[0, 1.55, 0.2]} material={goldTrim}><sphereGeometry args={[0.09, 10, 10]} /></mesh>
      <mesh position={[0, 1.35, 0.2]} material={goldTrim}><boxGeometry args={[0.48, 0.04, 0.03]} /></mesh>

      {/* Pauldrons (Layered Heavy Shoulders) */}
      <group position={[-0.46, 1.72, 0]}>
        <mesh material={steelMat}><sphereGeometry args={[0.2, 12, 12]} /></mesh>
        <mesh position={[-0.04, 0.05, 0]} material={goldTrim}><torusGeometry args={[0.18, 0.03, 8, 16]} /></mesh>
      </group>
      <group position={[0.46, 1.72, 0]}>
        <mesh material={steelMat}><sphereGeometry args={[0.2, 12, 12]} /></mesh>
        <mesh position={[0.04, 0.05, 0]} material={goldTrim}><torusGeometry args={[0.18, 0.03, 8, 16]} /></mesh>
      </group>

      {/* Arms & Spiked Gauntlets */}
      <mesh position={[-0.52, 1.32, 0]} rotation={[0, 0, 0.15]} material={darkSteel}><cylinderGeometry args={[0.09, 0.08, 0.55, 8]} /></mesh>
      <mesh position={[0.52, 1.32, 0]} rotation={[0, 0, -0.15]} material={darkSteel}><cylinderGeometry args={[0.09, 0.08, 0.55, 8]} /></mesh>
      <mesh position={[-0.58, 0.95, 0]} material={steelMat}><boxGeometry args={[0.17, 0.22, 0.17]} /></mesh>
      <mesh position={[0.58, 0.95, 0]} material={steelMat}><boxGeometry args={[0.17, 0.22, 0.17]} /></mesh>

      {/* Greathelm (Knight Helmet with Visor & Plume) */}
      <group position={[0, 2.05, 0]}>
        <mesh material={steelMat}><sphereGeometry args={[0.24, 16, 16]} /></mesh>
        {/* Glowing Visor Slit */}
        <mesh position={[0, -0.02, 0.22]} material={glowRune}><boxGeometry args={[0.28, 0.04, 0.03]} /></mesh>
        {/* Gold Crown Band */}
        <mesh position={[0, 0.08, 0]} material={goldTrim}><cylinderGeometry args={[0.25, 0.25, 0.05, 16]} /></mesh>
        {/* Red Helmet Plume */}
        <mesh position={[0, 0.28, -0.05]} rotation={[0.2, 0, 0]} material={redFabric}><coneGeometry args={[0.08, 0.35, 8]} /></mesh>
      </group>

      {/* Flowing Crimson Cape on Back */}
      <mesh ref={capeRef} position={[0, 1.3, -0.22]} rotation={[0.2, 0, 0]} material={redFabric}>
        <boxGeometry args={[0.65, 1.1, 0.03]} />
      </mesh>

      {/* Kite Shield (Left Arm) */}
      <group position={[-0.68, 1.15, 0.15]} rotation={[0, 0.4, 0]}>
        <mesh material={redFabric}><boxGeometry args={[0.42, 0.72, 0.04]} /></mesh>
        <mesh material={goldTrim} position={[0, 0, 0.025]}><boxGeometry args={[0.44, 0.74, 0.015]} /></mesh>
        <mesh material={goldTrim} position={[0, 0.1, 0.04]}><sphereGeometry args={[0.09, 10, 10]} /></mesh>
      </group>

      {/* Glowing Runic Greatsword (Right Hand) */}
      <group ref={swordRef} position={[0.66, 1.05, 0]}>
        {/* Grip & Pommel */}
        <mesh position={[0, 0.38, 0]} material={darkSteel}><cylinderGeometry args={[0.025, 0.025, 0.32, 8]} /></mesh>
        <mesh position={[0, 0.22, 0]} material={goldTrim}><sphereGeometry args={[0.05, 8, 8]} /></mesh>
        {/* Crossguard */}
        <mesh position={[0, 0.54, 0]} material={goldTrim}><boxGeometry args={[0.34, 0.06, 0.08]} /></mesh>
        {/* Broad Blade with Fuller */}
        <mesh position={[0, 1.25, 0]} material={steelMat}><boxGeometry args={[0.08, 1.35, 0.025]} /></mesh>
        {/* Glowing Runes on Blade Edge */}
        <mesh position={[0, 1.25, 0.015]} material={glowRune}><boxGeometry args={[0.03, 1.1, 0.01]} /></mesh>
      </group>

      <pointLight position={[0.7, 1.5, 0.3]} intensity={1.5} color="#ff8800" distance={2.5} />
    </group>
  );
}

/* ======================================================
   MAGE — Archmage of the Arcane
   ====================================================== */
function MageModel() {
  const group = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = -1.35 + Math.sin(t * 1.8) * 0.03;
      group.current.rotation.y = Math.sin(t * 0.5) * 0.15;
    }
    if (orbRef.current) {
      orbRef.current.position.y = 2.1 + Math.sin(t * 2.5) * 0.06;
      orbRef.current.rotation.y = t * 1.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 1.2;
      ringRef.current.rotation.x = t * 0.8;
    }
  });

  const robeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#101c4a', roughness: 0.7, metalness: 0.1 }), []);
  const silkTrim = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4d78d4', roughness: 0.4, metalness: 0.4 }), []);
  const goldTrim = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.9, roughness: 0.2 }), []);
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c29c78', roughness: 0.6 }), []);
  const staffWood = useMemo(() => new THREE.MeshStandardMaterial({ color: '#382210', roughness: 0.8 }), []);
  const crystalMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#66bbff', emissive: '#3388ff', emissiveIntensity: 1.2, roughness: 0.1 }), []);
  const runeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#77ccff', emissive: '#55aaff', emissiveIntensity: 1.5 }), []);

  return (
    <group ref={group} position={[0, -1.35, 0]}>
      {/* Flowing Robe Skirt (Flared Cone) */}
      <mesh position={[0, 0.75, 0]} material={robeMat}><cylinderGeometry args={[0.32, 0.58, 1.45, 14]} /></mesh>
      {/* Gold Embroidered Robe Hem */}
      <mesh position={[0, 0.05, 0]} material={goldTrim}><cylinderGeometry args={[0.59, 0.59, 0.08, 14]} /></mesh>

      {/* Robe Torso with Vestment Stole */}
      <mesh position={[0, 1.45, 0]} material={robeMat}><cylinderGeometry args={[0.26, 0.33, 0.65, 12]} /></mesh>
      <mesh position={[0, 1.45, 0.14]} material={silkTrim}><boxGeometry args={[0.2, 0.62, 0.08]} /></mesh>
      {/* High Wizard Mantle Collar */}
      <mesh position={[0, 1.76, -0.06]} rotation={[0.25, 0, 0]} material={silkTrim}><coneGeometry args={[0.38, 0.28, 8]} /></mesh>

      {/* Wide Flowing Sleeves */}
      <mesh position={[-0.42, 1.4, 0]} rotation={[0, 0, 0.3]} material={robeMat}><cylinderGeometry args={[0.12, 0.24, 0.65, 8]} /></mesh>
      <mesh position={[0.42, 1.4, 0]} rotation={[0, 0, -0.3]} material={robeMat}><cylinderGeometry args={[0.12, 0.24, 0.65, 8]} /></mesh>
      <mesh position={[-0.56, 1.15, 0]} material={skinMat}><sphereGeometry args={[0.07, 8, 8]} /></mesh>
      <mesh position={[0.56, 1.15, 0]} material={skinMat}><sphereGeometry args={[0.07, 8, 8]} /></mesh>

      {/* Head with Glowing Arcane Eyes in Hood Shadow */}
      <mesh position={[0, 1.95, 0]} material={skinMat}><sphereGeometry args={[0.18, 12, 12]} /></mesh>
      <mesh position={[-0.06, 1.96, 0.16]} material={runeMat}><sphereGeometry args={[0.03, 8, 8]} /></mesh>
      <mesh position={[0.06, 1.96, 0.16]} material={runeMat}><sphereGeometry args={[0.03, 8, 8]} /></mesh>

      {/* Pointed Ornate Wizard Hat */}
      <mesh position={[0, 2.05, 0]} material={silkTrim}><cylinderGeometry args={[0.38, 0.38, 0.04, 16]} /></mesh>
      <mesh position={[0, 2.32, 0]} rotation={[-0.1, 0, 0]} material={robeMat}><coneGeometry args={[0.26, 0.65, 12]} /></mesh>
      <mesh position={[0, 2.12, 0]} material={goldTrim}><torusGeometry args={[0.22, 0.025, 8, 16]} /></mesh>

      {/* Archmage Staff with Crystal and Orbiting Runes */}
      <group position={[0.65, 1.1, 0]} rotation={[0, 0, -0.08]}>
        {/* Ironwood Pole */}
        <mesh material={staffWood}><cylinderGeometry args={[0.03, 0.025, 2.2, 8]} /></mesh>
        {/* Crown Setting */}
        <mesh position={[0, 1.05, 0]} material={goldTrim}><coneGeometry args={[0.1, 0.18, 6]} /></mesh>
        {/* Levitating Crystal */}
        <mesh ref={orbRef} position={[0, 1.15, 0]} material={crystalMat}><octahedronGeometry args={[0.13, 0]} /></mesh>
        {/* Orbiting Arcane Ring */}
        <group ref={ringRef} position={[0, 1.15, 0]}>
          <mesh material={runeMat}><torusGeometry args={[0.24, 0.015, 6, 24]} /></mesh>
        </group>
      </group>

      <pointLight position={[0.65, 2.2, 0.2]} intensity={2.2} color="#5599ff" distance={3} />
    </group>
  );
}

/* ======================================================
   ROGUE — Shadow Assassin
   ====================================================== */
function RogueModel() {
  const group = useRef<THREE.Group>(null);
  const leftBlade = useRef<THREE.Group>(null);
  const rightBlade = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = -1.35 + Math.sin(t * 2.0) * 0.03;
      group.current.rotation.y = Math.sin(t * 0.6) * 0.2;
    }
    if (leftBlade.current) {
      leftBlade.current.rotation.x = 0.4 + Math.sin(t * 2.5) * 0.08;
    }
    if (rightBlade.current) {
      rightBlade.current.rotation.x = -0.3 + Math.sin(t * 2.5) * 0.08;
    }
  });

  const darkLeather = useMemo(() => new THREE.MeshStandardMaterial({ color: '#16101c', roughness: 0.85 }), []);
  const purpleAccent = useMemo(() => new THREE.MeshStandardMaterial({ color: '#522978', roughness: 0.5, metalness: 0.3 }), []);
  const venomBlade = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b57aff', emissive: '#8833dd', emissiveIntensity: 0.9, metalness: 0.9, roughness: 0.2 }), []);
  const maskMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#09060d', roughness: 0.95 }), []);

  return (
    <group ref={group} position={[0, -1.35, 0]}>
      {/* Boots */}
      <mesh position={[-0.16, 0.08, 0.06]} material={darkLeather}><boxGeometry args={[0.18, 0.15, 0.3]} /></mesh>
      <mesh position={[0.16, 0.08, 0.06]} material={darkLeather}><boxGeometry args={[0.18, 0.15, 0.3]} /></mesh>

      {/* Slim Agile Legs */}
      <mesh position={[-0.16, 0.52, 0.04]} rotation={[0.12, 0, 0.06]} material={darkLeather}><cylinderGeometry args={[0.09, 0.08, 0.85, 8]} /></mesh>
      <mesh position={[0.16, 0.52, 0.04]} rotation={[0.12, 0, -0.06]} material={darkLeather}><cylinderGeometry args={[0.09, 0.08, 0.85, 8]} /></mesh>

      {/* Studded Leather Torso */}
      <mesh position={[0, 1.25, 0]} material={darkLeather}><boxGeometry args={[0.46, 0.65, 0.3]} /></mesh>
      {/* Cross-body Dagger Harness */}
      <mesh position={[0, 1.3, 0.15]} rotation={[0, 0, 0.5]} material={purpleAccent}><boxGeometry args={[0.55, 0.06, 0.04]} /></mesh>
      <mesh position={[0, 1.3, 0.15]} rotation={[0, 0, -0.5]} material={purpleAccent}><boxGeometry args={[0.55, 0.06, 0.04]} /></mesh>

      {/* Shadow Cowl Hood */}
      <mesh position={[0, 1.88, 0]} material={maskMat}><sphereGeometry args={[0.2, 12, 12]} /></mesh>
      <mesh position={[0, 2.05, -0.04]} material={purpleAccent}><sphereGeometry args={[0.24, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} /></mesh>
      {/* Piercing Violet Assassin Eyes */}
      <mesh position={[-0.06, 1.88, 0.18]} material={venomBlade}><sphereGeometry args={[0.025, 6, 6]} /></mesh>
      <mesh position={[0.06, 1.88, 0.18]} material={venomBlade}><sphereGeometry args={[0.025, 6, 6]} /></mesh>

      {/* Twin Curved Venom Daggers */}
      <group ref={leftBlade} position={[-0.42, 1.05, 0.15]} rotation={[0.4, 0.2, 0.3]}>
        <mesh material={darkLeather}><cylinderGeometry args={[0.02, 0.02, 0.18, 6]} /></mesh>
        <mesh position={[0, 0.28, 0]} material={venomBlade}><boxGeometry args={[0.04, 0.45, 0.02]} /></mesh>
      </group>
      <group ref={rightBlade} position={[0.42, 1.05, 0.15]} rotation={[0.4, -0.2, -0.3]}>
        <mesh material={darkLeather}><cylinderGeometry args={[0.02, 0.02, 0.18, 6]} /></mesh>
        <mesh position={[0, 0.28, 0]} material={venomBlade}><boxGeometry args={[0.04, 0.45, 0.02]} /></mesh>
      </group>

      <pointLight position={[0, 1.2, 0.5]} intensity={1.2} color="#aa55ff" distance={2.5} />
    </group>
  );
}

/* ======================================================
   RANGER — Sylva Marksman
   ====================================================== */
function RangerModel() {
  const group = useRef<THREE.Group>(null);
  const bowRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = -1.35 + Math.sin(t * 1.6) * 0.025;
      group.current.rotation.y = Math.sin(t * 0.45) * 0.15;
    }
    if (bowRef.current) {
      bowRef.current.rotation.z = Math.sin(t * 1.2) * 0.06;
    }
  });

  const forestGreen = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a3d1c', roughness: 0.8 }), []);
  const leatherMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a2f18', roughness: 0.85 }), []);
  const bowWood = useMemo(() => new THREE.MeshStandardMaterial({ color: '#663d1a', roughness: 0.7, metalness: 0.1 }), []);
  const arrowGlow = useMemo(() => new THREE.MeshStandardMaterial({ color: '#72e084', emissive: '#44bb55', emissiveIntensity: 1.0 }), []);
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c49e7a', roughness: 0.6 }), []);

  return (
    <group ref={group} position={[0, -1.35, 0]}>
      {/* Boots & Leggings */}
      <mesh position={[-0.16, 0.08, 0.06]} material={leatherMat}><boxGeometry args={[0.18, 0.14, 0.3]} /></mesh>
      <mesh position={[0.16, 0.08, 0.06]} material={leatherMat}><boxGeometry args={[0.18, 0.14, 0.3]} /></mesh>
      <mesh position={[-0.16, 0.52, 0]} material={forestGreen}><cylinderGeometry args={[0.09, 0.08, 0.85, 8]} /></mesh>
      <mesh position={[0.16, 0.52, 0]} material={forestGreen}><cylinderGeometry args={[0.09, 0.08, 0.85, 8]} /></mesh>

      {/* Brigandine Vest */}
      <mesh position={[0, 1.25, 0]} material={leatherMat}><boxGeometry args={[0.48, 0.65, 0.32]} /></mesh>
      {/* Emerald Cloak */}
      <mesh position={[0, 1.45, -0.1]} material={forestGreen}><cylinderGeometry args={[0.26, 0.4, 0.6, 8]} /></mesh>

      {/* Hood & Keen Green Eyes */}
      <mesh position={[0, 1.92, 0]} material={skinMat}><sphereGeometry args={[0.19, 12, 12]} /></mesh>
      <mesh position={[0, 2.08, -0.04]} material={forestGreen}><sphereGeometry args={[0.23, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} /></mesh>
      <mesh position={[-0.06, 1.92, 0.16]} material={arrowGlow}><sphereGeometry args={[0.025, 6, 6]} /></mesh>
      <mesh position={[0.06, 1.92, 0.16]} material={arrowGlow}><sphereGeometry args={[0.025, 6, 6]} /></mesh>

      {/* Recurve Longbow with Silver String */}
      <group ref={bowRef} position={[0.55, 1.3, 0.15]}>
        <mesh rotation={[0, 0, 0.15]} material={bowWood}><torusGeometry args={[0.42, 0.03, 8, 24, Math.PI * 0.9]} /></mesh>
        <mesh position={[0, 0, 0.01]} rotation={[0, 0, 0.15]} material={arrowGlow}><cylinderGeometry args={[0.006, 0.006, 0.84, 4]} /></mesh>
      </group>

      {/* Quiver on Back with Arrows */}
      <mesh position={[-0.2, 1.35, -0.22]} rotation={[0.3, 0, 0]} material={leatherMat}><cylinderGeometry args={[0.08, 0.08, 0.5, 8]} /></mesh>
      <mesh position={[-0.18, 1.6, -0.22]} material={arrowGlow}><cylinderGeometry args={[0.015, 0.015, 0.4, 4]} /></mesh>

      <pointLight position={[0, 1.3, 0.4]} intensity={1.1} color="#55ee77" distance={2.5} />
    </group>
  );
}

/* ======================================================
   Floating Embers & Elemental Particles
   ====================================================== */
function Particles({ cls }: { cls: string }) {
  const ref = useRef<THREE.Points>(null);
  const count = 35;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cMap: Record<string, [number, number, number]> = {
      Warrior: [1.0, 0.55, 0.1],
      Mage:    [0.35, 0.6, 1.0],
      Rogue:   [0.7, 0.35, 1.0],
      Ranger:  [0.3, 0.9, 0.4],
    };
    const c = cMap[cls] || [1, 0.8, 0.3];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 2.5;
      pos[i * 3 + 1] = Math.random() * 3.5 - 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
      col[i * 3]     = c[0] + (Math.random() - 0.5) * 0.15;
      col[i * 3 + 1] = c[1] + (Math.random() - 0.5) * 0.15;
      col[i * 3 + 2] = c[2] + (Math.random() - 0.5) * 0.15;
    }
    return { positions: pos, colors: col };
  }, [cls]);

  useFrame((state) => {
    if (!ref.current) return;
    const array = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += 0.005;
      if (array[i * 3 + 1] > 3) array[i * 3 + 1] = -0.5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

/* ======================================================
   Master Scene
   ====================================================== */
function Scene({ cls }: { cls: string }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 4]} intensity={1.8} color="#fff6e8" castShadow />
      <directionalLight position={[-4, 3, -3]} intensity={0.6} color="#88bbff" />
      <pointLight position={[0, 2, 2]} intensity={0.8} color="#ffffff" distance={5} />

      <Suspense fallback={null}>
        <Float speed={1.1} rotationIntensity={0} floatIntensity={0.2}>
          {cls === 'Warrior' && <WarriorModel />}
          {cls === 'Mage' && <MageModel />}
          {cls === 'Rogue' && <RogueModel />}
          {cls === 'Ranger' && <RangerModel />}
          {!['Warrior', 'Mage', 'Rogue', 'Ranger'].includes(cls) && <WarriorModel />}
        </Float>
        <Particles cls={cls} />
        <ContactShadows position={[0, -1.36, 0]} opacity={0.65} scale={4} blur={2.5} color="#000" />
      </Suspense>
    </>
  );
}

export function Character3DViewer({ className = 'Warrior', size = 'md', showOrbit = true, mini = false }: Props) {
  const theme = CLASS_THEMES[className] ?? CLASS_THEMES.Warrior;

  const aspectClass = mini
    ? 'w-full h-full'
    : size === 'sm'
    ? 'aspect-square'
    : size === 'lg'
    ? 'aspect-[2/3]'
    : 'aspect-[3/4]';

  return (
    <div
      className={`relative w-full ${aspectClass} rounded-sm overflow-hidden`}
      style={{
        background: 'linear-gradient(180deg, #120e0a 0%, #080604 100%)',
        boxShadow: mini ? 'none' : `0 0 35px ${theme.accent}20, inset 0 0 25px rgba(0,0,0,0.8)`,
        border: mini ? 'none' : `1px solid ${theme.accent}30`,
      }}
    >
      {!mini && (
        <>
          {/* Ornate Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 pointer-events-none z-10" style={{ borderColor: theme.accent }} />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 pointer-events-none z-10" style={{ borderColor: theme.accent }} />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 pointer-events-none z-10" style={{ borderColor: theme.accent }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 pointer-events-none z-10" style={{ borderColor: theme.accent }} />

          {/* Class Banner Pill */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-widest shadow-md"
            style={{
              background: 'rgba(10,8,6,0.85)',
              border: `1px solid ${theme.accent}70`,
              color: theme.accent,
            }}
          >
            {className}
          </div>
        </>
      )}

      <Canvas camera={{ position: [0, 0.4, 3.4], fov: 42 }} shadows gl={{ antialias: true, alpha: true }}>
        <Scene cls={className} />
        {showOrbit && !mini && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI * 0.3}
            maxPolarAngle={Math.PI * 0.65}
          />
        )}
      </Canvas>

      {/* Ambient Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/20" />
    </div>
  );
}
