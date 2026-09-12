import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type FighterVariant = 'fox' | 'falco' | 'rival';

export interface FoxCharacter3DProps {
  variant?: FighterVariant;
  isAttacking?: boolean;
  isBlocking?: boolean;
  isDodging?: boolean;
  isHit?: boolean;
  isDead?: boolean;
  isMoving?: boolean;
  speedMultiplier?: number;
  glowColor?: string;
}

interface Palette {
  furPrimary: string;
  furSecondary: string;
  furMuzzle: string;
  furInnerEar: string;
  scarf: string;
  jacket: string;
  jacketTrim: string;
  innerSuit: string;
  pants: string;
  belt: string;
  beltBuckle: string;
  gloves: string;
  bootsMetal: string;
  bootsSole: string;
  headset: string;
  headsetMic: string;
  shineShield: string;
  shineWireframe: string;
}

const PALETTES: Record<FighterVariant, Palette> = {
  fox: {
    furPrimary: '#d97706', // Golden-orange Fox fur
    furSecondary: '#b45309', // Darker fur contours / ear tips
    furMuzzle: '#ffffff', // Crisp white cheeks and snout
    furInnerEar: '#fef3c7', // Warm creamy inner ear fluff
    scarf: '#dc2626', // Signature crimson red flight ascot
    jacket: '#f8fafc', // Classic white flight jacket
    jacketTrim: '#e2e8f0', // Jacket collar & fold seams
    innerSuit: '#15803d', // Olive green flight suit
    pants: '#166534', // Olive green combat trousers
    belt: '#1e293b', // Dark tactical belt
    beltBuckle: '#e2e8f0', // Chrome/silver buckle
    gloves: '#cbd5e1', // Light grey pilot gloves
    bootsMetal: '#94a3b8', // Iconic Star Fox silver bionic boots
    bootsSole: '#334155', // Heavy combat tread soles
    headset: '#64748b', // Tactical comms headset
    headsetMic: '#22c55e', // Glowing green comms LED / mic tip
    shineShield: '#00f0ff', // Melee cyan Reflector (Shine)
    shineWireframe: '#38bdf8',
  },
  falco: {
    furPrimary: '#2563eb', // Royal blue avian feathers
    furSecondary: '#1d4ed8', // Deep cobalt accents
    furMuzzle: '#fbbf24', // Golden hawk beak / crest
    furInnerEar: '#dbeafe', // Light blue crest
    scarf: '#ffffff', // Clean white ascot
    jacket: '#dc2626', // Crimson red flight vest / jacket
    jacketTrim: '#991b1b',
    innerSuit: '#1e293b', // Dark stealth flight suit
    pants: '#4c1d95', // Deep purple Melee pants
    belt: '#0f172a',
    beltBuckle: '#e2e8f0',
    gloves: '#cbd5e1',
    bootsMetal: '#94a3b8',
    bootsSole: '#1e293b',
    headset: '#475569',
    headsetMic: '#00f0ff',
    shineShield: '#38bdf8',
    shineWireframe: '#0284c7',
  },
  rival: {
    furPrimary: '#334155', // Wolf / Shadow fur
    furSecondary: '#1e293b',
    furMuzzle: '#94a3b8',
    furInnerEar: '#cbd5e1',
    scarf: '#991b1b', // Dark crimson
    jacket: '#0f172a', // Stealth black jacket
    jacketTrim: '#dc2626', // Red trim
    innerSuit: '#374151',
    pants: '#1f2937',
    belt: '#090d16',
    beltBuckle: '#ef4444',
    gloves: '#4b5563',
    bootsMetal: '#64748b',
    bootsSole: '#090d16',
    headset: '#1e293b',
    headsetMic: '#ef4444',
    shineShield: '#ff0055', // Crimson enemy Reflector
    shineWireframe: '#fb7185',
  },
};

/**
 * Procedural Fox McCloud (and Falco/Rival) 3D Model with complete Super Smash Bros. Melee details:
 * - Vulpine head, pointed ears with inner fluff, snout, nose, cheeks
 * - Tactical communicator headset with mic
 * - Popped-collar flight jacket with shoulder pads
 * - Red neck ascot / flight scarf
 * - Olive green combat flight suit with belt and silver buckle
 * - Pilot gloves with knuckle plates
 * - Star Fox bionic metal boots with articulated knee guards and ankle servos
 * - Dynamic harmonic tail sway
 * - Melee Reflector (Shine) hexagonal shield
 */
export const FoxCharacter3D: React.FC<FoxCharacter3DProps> = ({
  variant = 'fox',
  isAttacking = false,
  isBlocking = false,
  isDodging = false,
  isHit = false,
  isDead = false,
  isMoving = false,
}) => {
  const p = PALETTES[variant] || PALETTES.fox;

  // Skeletal Refs for Dynamic Animations
  const rootGroupRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const tailGroupRef = useRef<THREE.Group>(null);
  const tailTipRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const shineRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Reflector (Shine) Hexagon Shield Rotation
    if (shineRef.current && isBlocking) {
      shineRef.current.rotation.y += delta * 4.5;
      shineRef.current.rotation.x += delta * 2.8;
      shineRef.current.rotation.z += delta * 1.8;
      const pulse = 1.0 + Math.sin(t * 16) * 0.08;
      shineRef.current.scale.set(pulse, pulse, pulse);
    }

    // 2. Dead collapse
    if (isDead) {
      if (rootGroupRef.current) {
        rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(rootGroupRef.current.rotation.x, -Math.PI / 2, delta * 6);
        rootGroupRef.current.position.y = THREE.MathUtils.lerp(rootGroupRef.current.position.y, 0.15, delta * 6);
      }
      return;
    }

    // 3. Dynamic Bushy Tail Swaying Physics
    if (tailGroupRef.current) {
      const tailSwaySpeed = isMoving ? 14 : isAttacking ? 18 : 3.5;
      const tailSwayAmp = isMoving ? 0.35 : isAttacking ? 0.45 : 0.18;
      tailGroupRef.current.rotation.y = Math.sin(t * tailSwaySpeed) * tailSwayAmp;
      tailGroupRef.current.rotation.x = -0.25 + Math.cos(t * tailSwaySpeed * 0.5) * 0.08;

      if (tailTipRef.current) {
        tailTipRef.current.rotation.y = Math.sin(t * tailSwaySpeed - 0.5) * (tailSwayAmp * 0.8);
      }
    }

    // 4. Head subtle tracking & bobbing
    if (headGroupRef.current) {
      headGroupRef.current.position.y = 1.52 + (isMoving ? Math.abs(Math.sin(t * 12)) * 0.03 : Math.sin(t * 3) * 0.015);
      headGroupRef.current.rotation.y = isMoving ? Math.sin(t * 6) * 0.05 : 0;
    }

    // 5. Combat Poses: Attack, Block, Dodge, Movement & Idle
    if (isAttacking) {
      // Fox Forward Dash Punch / Kick lunge
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -1.6, delta * 20);
        leftArmRef.current.rotation.z = -0.2;
        leftArmRef.current.position.z = 0.35;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.7, delta * 20);
        rightArmRef.current.position.z = -0.15;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.4;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.5;
    } else if (isBlocking) {
      // Defensive Cross-guard inside Reflector Shine
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -1.1, delta * 15);
        leftArmRef.current.rotation.z = 0.4;
        leftArmRef.current.position.z = 0.18;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.1, delta * 15);
        rightArmRef.current.rotation.z = -0.4;
        rightArmRef.current.position.z = 0.18;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.2;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.2;
    } else if (isDodging) {
      // Fox Agile Sidestep / Crouch Spin
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0.6;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.6;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.6;
    } else if (isMoving) {
      // Fluid running stride
      const runCycle = t * 12;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(runCycle) * 0.9;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(runCycle) * 0.9;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.sin(runCycle) * 0.85;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(runCycle) * 0.85;
    } else {
      // Idle Combat Stance (Melee Fox energetic bounce)
      const bounce = Math.sin(t * 3.5);
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.65 + bounce * 0.05, delta * 8);
        leftArmRef.current.rotation.z = -0.25;
        leftArmRef.current.position.z = 0.12;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.55 - bounce * 0.05, delta * 8);
        rightArmRef.current.rotation.z = 0.25;
        rightArmRef.current.position.z = 0.08;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.08, delta * 8);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.08, delta * 8);
    }
  });

  // Hit flash material color
  const hitColor = isHit ? '#ffffff' : null;

  return (
    <group ref={rootGroupRef} position={[0, 0, 0]}>
      {/* ============================================================== */}
      {/* 1. MELEE REFLECTOR (SHINE) HEXAGONAL SHIELD (ON BLOCK)         */}
      {/* ============================================================== */}
      {isBlocking && (
        <group ref={shineRef} position={[0, 1.05, 0]}>
          {/* Inner Hexagonal Energy Core */}
          <mesh>
            <icosahedronGeometry args={[1.15, 1]} />
            <meshBasicMaterial
              color={p.shineShield}
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Outer Crystalline Facet Wireframe */}
          <mesh>
            <icosahedronGeometry args={[1.22, 1]} />
            <meshBasicMaterial
              color={p.shineWireframe}
              wireframe
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Hexagonal Flash Ring */}
          <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            <ringGeometry args={[1.05, 1.25, 6]} />
            <meshBasicMaterial color={p.shineShield} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* ============================================================== */}
      {/* 2. HEAD, FOX EARS, SNOUT, HEADSET & ASCOT                      */}
      {/* ============================================================== */}
      <group ref={headGroupRef} position={[0, 1.52, 0]}>
        {/* Fox Cranium */}
        <mesh castShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.22, 18, 18]} />
          <meshStandardMaterial
            color={hitColor || p.furPrimary}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* White Cheeks (Fluffy facial contours) */}
        <mesh position={[-0.14, -0.05, 0.08]} rotation={[0, -0.3, 0.2]}>
          <coneGeometry args={[0.11, 0.18, 12]} />
          <meshStandardMaterial color={hitColor || p.furMuzzle} roughness={0.8} />
        </mesh>
        <mesh position={[0.14, -0.05, 0.08]} rotation={[0, 0.3, -0.2]}>
          <coneGeometry args={[0.11, 0.18, 12]} />
          <meshStandardMaterial color={hitColor || p.furMuzzle} roughness={0.8} />
        </mesh>

        {/* Tapered White Muzzle / Snout */}
        <mesh position={[0, -0.04, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.11, 0.22, 16]} />
          <meshStandardMaterial color={hitColor || p.furMuzzle} roughness={0.75} />
        </mesh>

        {/* Black Nose Button */}
        <mesh position={[0, -0.02, 0.29]}>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Eyes (Determined Fox Eyes) */}
        <mesh position={[-0.08, 0.06, 0.18]} rotation={[0.05, -0.25, 0.1]}>
          <boxGeometry args={[0.055, 0.04, 0.02]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh position={[-0.085, 0.09, 0.17]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.07, 0.015, 0.02]} />
          <meshBasicMaterial color="#78350f" />
        </mesh>
        <mesh position={[0.08, 0.06, 0.18]} rotation={[0.05, 0.25, -0.1]}>
          <boxGeometry args={[0.055, 0.04, 0.02]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh position={[0.085, 0.09, 0.17]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.07, 0.015, 0.02]} />
          <meshBasicMaterial color="#78350f" />
        </mesh>

        {/* Left Fox Ear (Pointed, upright, angled outward) */}
        <group position={[-0.14, 0.2, -0.02]} rotation={[-0.15, 0, 0.3]}>
          {/* Outer Ear Shell */}
          <mesh castShadow>
            <coneGeometry args={[0.09, 0.26, 12]} />
            <meshStandardMaterial color={hitColor || p.furPrimary} roughness={0.7} />
          </mesh>
          {/* Ear Tip Dark Trim */}
          <mesh position={[0, 0.09, 0]}>
            <coneGeometry args={[0.045, 0.09, 12]} />
            <meshStandardMaterial color={hitColor || p.furSecondary} roughness={0.7} />
          </mesh>
          {/* Inner Ear Cream Fluff */}
          <mesh position={[0, -0.02, 0.035]} rotation={[-0.2, 0, 0]}>
            <coneGeometry args={[0.06, 0.18, 10]} />
            <meshStandardMaterial color={hitColor || p.furInnerEar} roughness={0.9} />
          </mesh>
        </group>

        {/* Right Fox Ear */}
        <group position={[0.14, 0.2, -0.02]} rotation={[-0.15, 0, -0.3]}>
          <mesh castShadow>
            <coneGeometry args={[0.09, 0.26, 12]} />
            <meshStandardMaterial color={hitColor || p.furPrimary} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <coneGeometry args={[0.045, 0.09, 12]} />
            <meshStandardMaterial color={hitColor || p.furSecondary} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.02, 0.035]} rotation={[-0.2, 0, 0]}>
            <coneGeometry args={[0.06, 0.18, 10]} />
            <meshStandardMaterial color={hitColor || p.furInnerEar} roughness={0.9} />
          </mesh>
        </group>

        {/* Tactical Headset Communicator (Left Ear Earpiece & Headband) */}
        <group position={[-0.23, 0.05, 0]}>
          {/* Metallic Ear Cup */}
          <mesh>
            <cylinderGeometry args={[0.065, 0.065, 0.05, 16]} />
            <meshStandardMaterial color={p.headset} roughness={0.25} metalness={0.85} />
          </mesh>
          {/* Headset Silver Accent Plate */}
          <mesh position={[-0.03, 0, 0]}>
            <boxGeometry args={[0.02, 0.09, 0.09]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Headband Arc going over head */}
          <mesh position={[0.1, 0.17, 0]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.015, 0.015, 0.26, 8]} />
            <meshStandardMaterial color={p.headset} roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Tactical Boom Microphone extending toward snout */}
          <mesh position={[0.06, -0.06, 0.12]} rotation={[0.4, 0.6, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.16, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Glowing Mic Tip / Sensor */}
          <mesh position={[0.11, -0.09, 0.2]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={p.headsetMic} />
          </mesh>
        </group>

        {/* Signature Crimson Ascot / Neck Scarf */}
        <group position={[0, -0.19, 0.04]}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.15, 0.055, 12, 24]} />
            <meshStandardMaterial color={hitColor || p.scarf} roughness={0.65} metalness={0.1} />
          </mesh>
          {/* Ascot Knot Fold */}
          <mesh position={[0, -0.04, 0.12]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.1, 0.11, 0.06]} />
            <meshStandardMaterial color={hitColor || p.scarf} roughness={0.65} />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 3. TORSO: WHITE FLIGHT JACKET, POPPED COLLAR & OLIVE SUIT      */}
      {/* ============================================================== */}
      <group position={[0, 1.08, 0]}>
        {/* Inner Olive Flight Suit Chest & Belly */}
        <mesh position={[0, -0.02, 0]} castShadow>
          <capsuleGeometry args={[0.24, 0.42, 8, 16]} />
          <meshStandardMaterial color={hitColor || p.innerSuit} roughness={0.65} />
        </mesh>

        {/* Iconic White Flight Jacket (Main Body) */}
        <mesh position={[0, 0.04, -0.02]} castShadow>
          <boxGeometry args={[0.56, 0.46, 0.38]} />
          <meshStandardMaterial color={hitColor || p.jacket} roughness={0.4} metalness={0.15} />
        </mesh>

        {/* Popped Stand-Up Jacket Collar behind the neck */}
        <mesh position={[0, 0.28, -0.12]} rotation={[-0.25, 0, 0]}>
          <boxGeometry args={[0.44, 0.16, 0.07]} />
          <meshStandardMaterial color={hitColor || p.jacketTrim} roughness={0.4} />
        </mesh>
        {/* Left Popped Collar Wing */}
        <mesh position={[-0.2, 0.26, 0.01]} rotation={[-0.1, -0.4, 0.2]}>
          <boxGeometry args={[0.12, 0.16, 0.06]} />
          <meshStandardMaterial color={hitColor || p.jacketTrim} roughness={0.4} />
        </mesh>
        {/* Right Popped Collar Wing */}
        <mesh position={[0.2, 0.26, 0.01]} rotation={[-0.1, 0.4, -0.2]}>
          <boxGeometry args={[0.12, 0.16, 0.06]} />
          <meshStandardMaterial color={hitColor || p.jacketTrim} roughness={0.4} />
        </mesh>

        {/* Jacket Open Front Lapels (Revealing Olive Suit & Ascot) */}
        <mesh position={[-0.18, 0.02, 0.18]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[0.14, 0.4, 0.05]} />
          <meshStandardMaterial color={hitColor || p.jacket} roughness={0.4} />
        </mesh>
        <mesh position={[0.18, 0.02, 0.18]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.14, 0.4, 0.05]} />
          <meshStandardMaterial color={hitColor || p.jacket} roughness={0.4} />
        </mesh>

        {/* Shoulder Caps / Epaulets */}
        <mesh position={[-0.32, 0.22, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.14, 0.06, 0.26]} />
          <meshStandardMaterial color={hitColor || p.jacketTrim} roughness={0.4} />
        </mesh>
        <mesh position={[0.32, 0.22, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.14, 0.06, 0.26]} />
          <meshStandardMaterial color={hitColor || p.jacketTrim} roughness={0.4} />
        </mesh>

        {/* Utility Combat Belt */}
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.1, 16]} />
          <meshStandardMaterial color={p.belt} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Silver Chrome Belt Buckle */}
        <mesh position={[0, -0.28, 0.27]}>
          <boxGeometry args={[0.12, 0.09, 0.04]} />
          <meshStandardMaterial color={p.beltBuckle} roughness={0.15} metalness={0.9} />
        </mesh>
        {/* Side Utility Pouches */}
        <mesh position={[-0.28, -0.28, 0.04]}>
          <boxGeometry args={[0.07, 0.11, 0.12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[0.28, -0.28, 0.04]}>
          <boxGeometry args={[0.07, 0.11, 0.12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 4. BUSHY FOX TAIL WITH DYNAMIC SWAY                            */}
      {/* ============================================================== */}
      <group ref={tailGroupRef} position={[0, 0.82, -0.22]}>
        {/* Tail Base (Golden Orange Fur) */}
        <mesh position={[0, 0.06, -0.16]} rotation={[-0.45, 0, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.28, 8, 12]} />
          <meshStandardMaterial color={hitColor || p.furPrimary} roughness={0.8} />
        </mesh>
        {/* Tail Middle Bulge */}
        <mesh position={[0, 0.22, -0.36]} rotation={[-0.7, 0, 0]} castShadow>
          <sphereGeometry args={[0.17, 14, 14]} />
          <meshStandardMaterial color={hitColor || p.furPrimary} roughness={0.85} />
        </mesh>
        {/* Tail Tip Group (Distinctive White Fluffy Tip) */}
        <group ref={tailTipRef} position={[0, 0.36, -0.52]}>
          <mesh rotation={[-0.9, 0, 0]} castShadow>
            <coneGeometry args={[0.15, 0.32, 14]} />
            <meshStandardMaterial color={hitColor || p.furMuzzle} roughness={0.85} />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 5. ARMS: JACKET SLEEVES & PILOT COMBAT GLOVES                   */}
      {/* ============================================================== */}
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.34, 1.22, 0]}>
        {/* Upper Arm / White Sleeve */}
        <mesh position={[-0.06, -0.15, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.085, 0.08, 0.26, 12]} />
          <meshStandardMaterial color={hitColor || p.jacket} roughness={0.4} />
        </mesh>
        {/* Forearm & Sleeve Cuff */}
        <mesh position={[-0.08, -0.32, 0.06]}>
          <cylinderGeometry args={[0.09, 0.085, 0.18, 12]} />
          <meshStandardMaterial color={hitColor || p.jacketTrim} roughness={0.45} />
        </mesh>
        {/* Pilot Combat Glove */}
        <mesh position={[-0.08, -0.46, 0.12]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.13, 0.18, 0.13]} />
          <meshStandardMaterial color={hitColor || p.gloves} roughness={0.35} metalness={0.65} />
        </mesh>
        {/* Reinforced Knuckle Guard Plate */}
        <mesh position={[-0.08, -0.52, 0.18]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.11, 0.06, 0.05]} />
          <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.34, 1.22, 0]}>
        {/* Upper Arm / White Sleeve */}
        <mesh position={[0.06, -0.15, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.085, 0.08, 0.26, 12]} />
          <meshStandardMaterial color={hitColor || p.jacket} roughness={0.4} />
        </mesh>
        {/* Forearm & Sleeve Cuff */}
        <mesh position={[0.08, -0.32, 0.06]}>
          <cylinderGeometry args={[0.09, 0.085, 0.18, 12]} />
          <meshStandardMaterial color={hitColor || p.jacketTrim} roughness={0.45} />
        </mesh>
        {/* Pilot Combat Glove */}
        <mesh position={[0.08, -0.46, 0.12]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.13, 0.18, 0.13]} />
          <meshStandardMaterial color={hitColor || p.gloves} roughness={0.35} metalness={0.65} />
        </mesh>
        {/* Reinforced Knuckle Guard Plate */}
        <mesh position={[0.08, -0.52, 0.18]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.11, 0.06, 0.05]} />
          <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 6. LEGS: OLIVE PANTS & STAR FOX BIONIC METAL BOOTS             */}
      {/* ============================================================== */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.17, 0.76, 0]}>
        {/* Olive Green Thigh / Pants */}
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.1, 0.32, 12]} />
          <meshStandardMaterial color={hitColor || p.pants} roughness={0.7} />
        </mesh>
        {/* Thigh Holster Strap */}
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.115, 0.115, 0.06, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>

        {/* Bionic Metal Boot: Knee Armor Plate */}
        <mesh position={[0, -0.34, 0.05]}>
          <boxGeometry args={[0.14, 0.12, 0.08]} />
          <meshStandardMaterial color={p.bootsMetal} roughness={0.2} metalness={0.88} />
        </mesh>

        {/* Bionic Metal Boot: Shin Greave */}
        <mesh position={[0, -0.5, 0.01]} castShadow>
          <cylinderGeometry args={[0.095, 0.085, 0.32, 14]} />
          <meshStandardMaterial color={p.bootsMetal} roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Bionic Ankle Pivot Servos */}
        <mesh position={[-0.08, -0.62, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 10]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0.08, -0.62, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 10]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Metal Foot & Combat Sole */}
        <mesh position={[0, -0.68, 0.08]} castShadow>
          <boxGeometry args={[0.13, 0.1, 0.24]} />
          <meshStandardMaterial color={p.bootsMetal} roughness={0.25} metalness={0.85} />
        </mesh>
        <mesh position={[0, -0.73, 0.08]}>
          <boxGeometry args={[0.14, 0.03, 0.25]} />
          <meshStandardMaterial color={p.bootsSole} roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.17, 0.76, 0]}>
        {/* Olive Green Thigh / Pants */}
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.1, 0.32, 12]} />
          <meshStandardMaterial color={hitColor || p.pants} roughness={0.7} />
        </mesh>
        {/* Thigh Holster Strap */}
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.115, 0.115, 0.06, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>

        {/* Bionic Metal Boot: Knee Armor Plate */}
        <mesh position={[0, -0.34, 0.05]}>
          <boxGeometry args={[0.14, 0.12, 0.08]} />
          <meshStandardMaterial color={p.bootsMetal} roughness={0.2} metalness={0.88} />
        </mesh>

        {/* Bionic Metal Boot: Shin Greave */}
        <mesh position={[0, -0.5, 0.01]} castShadow>
          <cylinderGeometry args={[0.095, 0.085, 0.32, 14]} />
          <meshStandardMaterial color={p.bootsMetal} roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Bionic Ankle Pivot Servos */}
        <mesh position={[-0.08, -0.62, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 10]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0.08, -0.62, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 10]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Metal Foot & Combat Sole */}
        <mesh position={[0, -0.68, 0.08]} castShadow>
          <boxGeometry args={[0.13, 0.1, 0.24]} />
          <meshStandardMaterial color={p.bootsMetal} roughness={0.25} metalness={0.85} />
        </mesh>
        <mesh position={[0, -0.73, 0.08]}>
          <boxGeometry args={[0.14, 0.03, 0.25]} />
          <meshStandardMaterial color={p.bootsSole} roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 7. GROUND SHADOW                                               */}
      {/* ============================================================== */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.45} />
      </mesh>
    </group>
  );
};

export default FoxCharacter3D;
