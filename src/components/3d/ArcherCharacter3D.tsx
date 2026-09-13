import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type ArcherCostumePalette = 'classic' | 'red' | 'blue' | 'green' | 'dark';

export interface ArcherCharacter3DProps {
  costume?: ArcherCostumePalette;
  isAttacking?: boolean;
  isBlocking?: boolean;
  isDodging?: boolean;
  isHit?: boolean;
  isDead?: boolean;
  isMoving?: boolean;
  speedMultiplier?: number;
  glowColor?: string;
}

interface ArcherPalette {
  suitBase: string;
  armorPlates: string;
  accentNeon: string;
  glowEnergy: string;
  visorColor: string;
  bowFrame: string;
  bowString: string;
  cape: string;
  shieldColor: string;
}

const ARCHER_PALETTES: Record<ArcherCostumePalette, ArcherPalette> = {
  classic: {
    suitBase: '#0f172a',
    armorPlates: '#1e1b4b',
    accentNeon: '#9333ea',
    glowEnergy: '#c084fc',
    visorColor: '#00f0ff',
    bowFrame: '#312e81',
    bowString: '#a855f7',
    cape: '#581c87',
    shieldColor: '#a855f7',
  },
  red: {
    suitBase: '#18181b',
    armorPlates: '#450a0a',
    accentNeon: '#ef4444',
    glowEnergy: '#f87171',
    visorColor: '#fbbf24',
    bowFrame: '#7f1d1d',
    bowString: '#f87171',
    cape: '#991b1b',
    shieldColor: '#ef4444',
  },
  blue: {
    suitBase: '#0b132b',
    armorPlates: '#1c2541',
    accentNeon: '#38bdf8',
    glowEnergy: '#7dd3fc',
    visorColor: '#34d399',
    bowFrame: '#0f172a',
    bowString: '#38bdf8',
    cape: '#1e3a8a',
    shieldColor: '#38bdf8',
  },
  green: {
    suitBase: '#062016',
    armorPlates: '#064e3b',
    accentNeon: '#10b981',
    glowEnergy: '#34d399',
    visorColor: '#a7f3d0',
    bowFrame: '#022c22',
    bowString: '#10b981',
    cape: '#047857',
    shieldColor: '#10b981',
  },
  dark: {
    suitBase: '#09090b',
    armorPlates: '#18181b',
    accentNeon: '#eab308',
    glowEnergy: '#facc15',
    visorColor: '#f59e0b',
    bowFrame: '#27272a',
    bowString: '#fbbf24',
    cape: '#3f3f46',
    shieldColor: '#eab308',
  },
};

export const ArcherCharacter3D: React.FC<ArcherCharacter3DProps> = ({
  costume = 'classic',
  isAttacking = false,
  isBlocking = false,
  isDodging = false,
  isHit = false,
  isDead = false,
  isMoving = false,
  speedMultiplier = 1,
  glowColor,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const torsoGroupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const bowGroupRef = useRef<THREE.Group>(null);
  const bowStringUpperRef = useRef<THREE.Mesh>(null);
  const bowStringLowerRef = useRef<THREE.Mesh>(null);
  const loadedArrowRef = useRef<THREE.Group>(null);
  const shieldRef = useRef<THREE.Mesh>(null);
  const capeRef = useRef<THREE.Group>(null);

  const p = ARCHER_PALETTES[costume] || ARCHER_PALETTES.classic;
  const effectiveGlow = glowColor || p.glowEnergy;
  const hitColor = isHit ? '#ffffff' : undefined;

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Plasma Shield Rotation and Pulse
    if (shieldRef.current) {
      if (isBlocking) {
        shieldRef.current.visible = true;
        shieldRef.current.rotation.z += delta * 6;
        const pulse = 1.0 + Math.sin(t * 18) * 0.08;
        shieldRef.current.scale.set(pulse, pulse, pulse);
      } else {
        shieldRef.current.visible = false;
      }
    }

    // 2. Dead collapse / Stand Up when Alive
    if (isDead) {
      if (rootGroupRef.current) {
        rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(rootGroupRef.current.rotation.x, -Math.PI / 2, delta * 6);
        rootGroupRef.current.position.y = THREE.MathUtils.lerp(rootGroupRef.current.position.y, 0.15, delta * 6);
      }
      return;
    } else if (rootGroupRef.current) {
      rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(rootGroupRef.current.rotation.x, 0, delta * 12);
      rootGroupRef.current.position.y = THREE.MathUtils.lerp(rootGroupRef.current.position.y, 0, delta * 12);
    }

    // 3. Cape Dynamics
    if (capeRef.current) {
      const capeSpeed = isMoving ? 14 : isAttacking ? 8 : 2.5;
      const capeWave = Math.sin(t * capeSpeed) * (isMoving ? 0.35 : 0.1);
      capeRef.current.rotation.x = 0.2 + (isMoving ? 0.3 : 0.05) + capeWave;
      capeRef.current.rotation.y = Math.cos(t * capeSpeed * 0.5) * 0.08;
    }

    // 4. Head subtle tracking & bobbing
    if (headGroupRef.current) {
      headGroupRef.current.position.y = 1.52 + (isMoving ? Math.abs(Math.sin(t * 12)) * 0.03 : Math.sin(t * 3) * 0.015);
      headGroupRef.current.rotation.y = isMoving ? Math.sin(t * 6) * 0.05 : 0;
    }

    // 5. Combat Poses: Archery Draw & Aim, Shield Block, Dodge, Movement & Idle
    if (isAttacking) {
      // Sniper Stance: Left arm raises and holds bow straight toward target
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -Math.PI / 2, delta * 18);
        leftArmRef.current.rotation.y = THREE.MathUtils.lerp(leftArmRef.current.rotation.y, 0.25, delta * 18);
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0, delta * 18);
        leftArmRef.current.position.set(-0.35, 1.25, 0.3);
      }
      // Right arm draws back string to cheek
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -Math.PI / 2 + 0.3, delta * 18);
        rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, -0.6, delta * 18);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0.4, delta * 18);
        rightArmRef.current.position.set(0.28, 1.35, 0.05);
      }
      // Show loaded arrow during attack draw
      if (loadedArrowRef.current) {
        loadedArrowRef.current.visible = true;
      }
      // Bow string pulled back
      if (bowStringUpperRef.current && bowStringLowerRef.current) {
        bowStringUpperRef.current.rotation.z = -0.3;
        bowStringLowerRef.current.rotation.z = 0.3;
      }

      // Braced sniper stance legs
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.35;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.45;
    } else if (isBlocking) {
      // Raise bow arm as shield guard
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -1.2, delta * 15);
        leftArmRef.current.rotation.y = 0.5;
        leftArmRef.current.position.set(-0.25, 1.2, 0.25);
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.8, delta * 15);
        rightArmRef.current.rotation.y = -0.3;
        rightArmRef.current.position.set(0.28, 1.1, 0.15);
      }
      if (loadedArrowRef.current) loadedArrowRef.current.visible = false;
      if (bowStringUpperRef.current && bowStringLowerRef.current) {
        bowStringUpperRef.current.rotation.z = 0;
        bowStringLowerRef.current.rotation.z = 0;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.2;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.2;
    } else if (isDodging) {
      // Tactical Evasive Slide / Roll
      if (rootGroupRef.current) {
        rootGroupRef.current.rotation.z = Math.sin(t * 16) * 0.35;
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.8;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.6;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.6;
      if (loadedArrowRef.current) loadedArrowRef.current.visible = false;
    } else if (isMoving) {
      // Running animation
      const runSpeed = 14 * speedMultiplier;
      const armSwing = Math.sin(t * runSpeed) * 0.65;
      const legSwing = Math.sin(t * runSpeed) * 0.75;

      if (rootGroupRef.current) {
        rootGroupRef.current.rotation.z = THREE.MathUtils.lerp(rootGroupRef.current.rotation.z, 0, delta * 8);
      }

      // Left arm carries bow forward
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.4 + armSwing * 0.35;
        leftArmRef.current.rotation.y = 0.15;
        leftArmRef.current.rotation.z = 0;
        leftArmRef.current.position.set(-0.35, 1.2, 0.1);
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -armSwing;
        rightArmRef.current.rotation.y = 0;
        rightArmRef.current.rotation.z = -0.15;
        rightArmRef.current.position.set(0.35, 1.2, 0);
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
      if (loadedArrowRef.current) loadedArrowRef.current.visible = false;
      if (bowStringUpperRef.current && bowStringLowerRef.current) {
        bowStringUpperRef.current.rotation.z = 0;
        bowStringLowerRef.current.rotation.z = 0;
      }
    } else {
      // Idle Breathing & Bow Ready stance
      const breath = Math.sin(t * 3.5) * 0.04;
      const armSway = Math.cos(t * 3) * 0.03;

      if (rootGroupRef.current) {
        rootGroupRef.current.rotation.z = THREE.MathUtils.lerp(rootGroupRef.current.rotation.z, 0, delta * 8);
      }

      // Left arm holds bow relaxed diagonally across hip/front
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.4 + breath, delta * 8);
        leftArmRef.current.rotation.y = THREE.MathUtils.lerp(leftArmRef.current.rotation.y, 0.3, delta * 8);
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, -0.1, delta * 8);
        leftArmRef.current.position.set(-0.35, 1.2, 0.1);
      }
      // Right arm relaxed with hand near quiver
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.15 + armSway, delta * 8);
        rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, -0.15, delta * 8);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.1, delta * 8);
        rightArmRef.current.position.set(0.35, 1.2, 0);
      }

      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 8);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 8);
      if (loadedArrowRef.current) loadedArrowRef.current.visible = false;
      if (bowStringUpperRef.current && bowStringLowerRef.current) {
        bowStringUpperRef.current.rotation.z = 0;
        bowStringLowerRef.current.rotation.z = 0;
      }
    }
  });

  return (
    <group ref={rootGroupRef}>
      {/* ============================================================== */}
      {/* 1. HEAD & VISOR OPTICS                                         */}
      {/* ============================================================== */}
      <group ref={headGroupRef} position={[0, 1.52, 0]}>
        {/* Sleek Stealth Helm / Cowl */}
        <mesh castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color={hitColor || p.armorPlates} roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Tactical Sniper Hood Rim */}
        <mesh position={[0, 0.08, 0.06]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.28, 0.08, 0.24]} />
          <meshStandardMaterial color={hitColor || p.cape} roughness={0.8} />
        </mesh>

        {/* Glowing Neon Sniper Visor / Ocular Monocle */}
        <mesh position={[0, 0.02, 0.2]}>
          <boxGeometry args={[0.26, 0.07, 0.06]} />
          <meshStandardMaterial
            color={hitColor || p.visorColor}
            emissive={p.visorColor}
            emissiveIntensity={1.8}
            roughness={0.1}
          />
        </mesh>

        {/* Visor Reticle Dot (Right Eye Zoom Scope) */}
        <mesh position={[0.07, 0.02, 0.235]}>
          <cylinderGeometry args={[0.022, 0.022, 0.02, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2.5}
            roughness={0}
          />
        </mesh>

        {/* Communications Antenna / Neural Uplink */}
        <mesh position={[-0.22, 0.08, -0.05]} rotation={[0, 0, 0.35]}>
          <cylinderGeometry args={[0.015, 0.008, 0.25, 8]} />
          <meshStandardMaterial color={p.accentNeon} metalness={0.8} />
        </mesh>
        <mesh position={[-0.26, 0.2, -0.05]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color={p.accentNeon} emissive={p.accentNeon} emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 2. TORSO & CHEST ARMOR                                         */}
      {/* ============================================================== */}
      <group ref={torsoGroupRef} position={[0, 1.1, 0]}>
        {/* Undersuit Core */}
        <mesh castShadow>
          <boxGeometry args={[0.38, 0.52, 0.22]} />
          <meshStandardMaterial color={hitColor || p.suitBase} roughness={0.6} />
        </mesh>

        {/* Cyber Carbon Chestplate */}
        <mesh position={[0, 0.06, 0.1]}>
          <boxGeometry args={[0.34, 0.32, 0.08]} />
          <meshStandardMaterial color={hitColor || p.armorPlates} roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Plasma Energy Core Badge */}
        <mesh position={[0, 0.08, 0.15]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshStandardMaterial
            color={p.accentNeon}
            emissive={p.accentNeon}
            emissiveIntensity={2.2}
            roughness={0.2}
          />
        </mesh>

        {/* Tactical Belt & Ammo Pouches */}
        <mesh position={[0, -0.24, 0]}>
          <boxGeometry args={[0.4, 0.08, 0.24]} />
          <meshStandardMaterial color="#09090b" roughness={0.5} />
        </mesh>
        <mesh position={[-0.14, -0.24, 0.12]}>
          <boxGeometry args={[0.08, 0.09, 0.06]} />
          <meshStandardMaterial color={p.armorPlates} metalness={0.6} />
        </mesh>
        <mesh position={[0.14, -0.24, 0.12]}>
          <boxGeometry args={[0.08, 0.09, 0.06]} />
          <meshStandardMaterial color={p.armorPlates} metalness={0.6} />
        </mesh>

        {/* ============================================================ */}
        {/* BACK QUIVER WITH PLASMA ARROWS                               */}
        {/* ============================================================ */}
        <group position={[0.12, 0.05, -0.15]} rotation={[0.2, 0.1, -0.3]}>
          {/* Quiver Cylinder Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.045, 0.46, 12]} />
            <meshStandardMaterial color={p.armorPlates} roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Quiver Energy Trim */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.04, 12]} />
            <meshStandardMaterial color={p.accentNeon} emissive={p.accentNeon} emissiveIntensity={1.5} />
          </mesh>
          {/* Quiver Arrow Shafts & Glowing Fletchings */}
          {[-0.025, 0, 0.025].map((xOffset, i) => (
            <group key={i} position={[xOffset, 0.24 + i * 0.03, (i - 1) * 0.02]}>
              {/* Shaft */}
              <mesh>
                <cylinderGeometry args={[0.008, 0.008, 0.2, 8]} />
                <meshStandardMaterial color="#27272a" metalness={0.8} />
              </mesh>
              {/* Energy Fletching */}
              <mesh position={[0, 0.09, 0]}>
                <boxGeometry args={[0.04, 0.06, 0.01]} />
                <meshStandardMaterial color={p.glowEnergy} emissive={p.glowEnergy} emissiveIntensity={2.5} />
              </mesh>
            </group>
          ))}
        </group>

        {/* ============================================================ */}
        {/* TACTICAL CAPE / CLOAK                                        */}
        {/* ============================================================ */}
        <group ref={capeRef} position={[0, 0.2, -0.12]}>
          <mesh castShadow>
            <boxGeometry args={[0.36, 0.72, 0.03]} />
            <meshStandardMaterial color={p.cape} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 3. LEFT ARM & CYBER PLASMA BOW                                 */}
      {/* ============================================================== */}
      <group ref={leftArmRef} position={[-0.35, 1.2, 0]}>
        {/* Shoulder Pauldron */}
        <mesh position={[-0.04, 0.05, 0]}>
          <boxGeometry args={[0.15, 0.16, 0.18]} />
          <meshStandardMaterial color={hitColor || p.armorPlates} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Upper Arm */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.06, 0.22, 10]} />
          <meshStandardMaterial color={hitColor || p.suitBase} roughness={0.5} />
        </mesh>
        {/* Forearm & Archer Bracer */}
        <mesh position={[0, -0.36, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.22, 10]} />
          <meshStandardMaterial color={hitColor || p.armorPlates} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Forearm Neon Conduit */}
        <mesh position={[-0.04, -0.36, 0]}>
          <boxGeometry args={[0.02, 0.18, 0.04]} />
          <meshStandardMaterial color={p.accentNeon} emissive={p.accentNeon} emissiveIntensity={1.8} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.48, 0]}>
          <boxGeometry args={[0.07, 0.08, 0.07]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} />
        </mesh>

        {/* ============================================================ */}
        {/* CYBER PLASMA BOW (ATTACHED TO LEFT HAND)                     */}
        {/* ============================================================ */}
        <group ref={bowGroupRef} position={[0, -0.48, 0.12]} rotation={[0, 0, -0.2]}>
          {/* Bow Central Grip / Riser */}
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.18, 0.06]} />
            <meshStandardMaterial color={p.bowFrame} roughness={0.3} metalness={0.9} />
          </mesh>

          {/* Holographic Scope Projector */}
          <mesh position={[0.04, 0.02, 0.05]}>
            <cylinderGeometry args={[0.02, 0.02, 0.08, 10]} />
            <meshStandardMaterial color={p.accentNeon} emissive={p.accentNeon} emissiveIntensity={2.0} />
          </mesh>

          {/* Upper Limb - Section 1 */}
          <group position={[0, 0.16, 0]} rotation={[0, 0, 0.25]}>
            <mesh castShadow>
              <boxGeometry args={[0.04, 0.24, 0.04]} />
              <meshStandardMaterial color={p.bowFrame} roughness={0.3} metalness={0.9} />
            </mesh>
            {/* Upper Limb Neon Channel */}
            <mesh position={[0.015, 0, 0]}>
              <boxGeometry args={[0.01, 0.2, 0.02]} />
              <meshStandardMaterial color={p.accentNeon} emissive={p.accentNeon} emissiveIntensity={1.5} />
            </mesh>
            {/* Upper Limb - Section 2 (Recurved Tip) */}
            <group position={[0, 0.16, 0]} rotation={[0, 0, 0.45]}>
              <mesh castShadow>
                <boxGeometry args={[0.035, 0.22, 0.035]} />
                <meshStandardMaterial color={p.bowFrame} roughness={0.3} metalness={0.9} />
              </mesh>
              {/* Upper String Nock Emitter */}
              <mesh position={[0, 0.11, 0]}>
                <sphereGeometry args={[0.025, 10, 10]} />
                <meshStandardMaterial color={p.bowString} emissive={p.bowString} emissiveIntensity={2.5} />
              </mesh>
            </group>
          </group>

          {/* Lower Limb - Section 1 */}
          <group position={[0, -0.16, 0]} rotation={[0, 0, -0.25]}>
            <mesh castShadow>
              <boxGeometry args={[0.04, 0.24, 0.04]} />
              <meshStandardMaterial color={p.bowFrame} roughness={0.3} metalness={0.9} />
            </mesh>
            {/* Lower Limb Neon Channel */}
            <mesh position={[0.015, 0, 0]}>
              <boxGeometry args={[0.01, 0.2, 0.02]} />
              <meshStandardMaterial color={p.accentNeon} emissive={p.accentNeon} emissiveIntensity={1.5} />
            </mesh>
            {/* Lower Limb - Section 2 (Recurved Tip) */}
            <group position={[0, -0.16, 0]} rotation={[0, 0, -0.45]}>
              <mesh castShadow>
                <boxGeometry args={[0.035, 0.22, 0.035]} />
                <meshStandardMaterial color={p.bowFrame} roughness={0.3} metalness={0.9} />
              </mesh>
              {/* Lower String Nock Emitter */}
              <mesh position={[0, -0.11, 0]}>
                <sphereGeometry args={[0.025, 10, 10]} />
                <meshStandardMaterial color={p.bowString} emissive={p.bowString} emissiveIntensity={2.5} />
              </mesh>
            </group>
          </group>

          {/* Glowing Energy Bowstring (Upper & Lower Segments) */}
          <mesh ref={bowStringUpperRef} position={[-0.04, 0.22, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.44, 8]} />
            <meshStandardMaterial color={p.bowString} emissive={p.bowString} emissiveIntensity={2.5} roughness={0} />
          </mesh>
          <mesh ref={bowStringLowerRef} position={[-0.04, -0.22, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.44, 8]} />
            <meshStandardMaterial color={p.bowString} emissive={p.bowString} emissiveIntensity={2.5} roughness={0} />
          </mesh>

          {/* Loaded Plasma Arrow (Visible while drawing) */}
          <group ref={loadedArrowRef} position={[-0.02, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
            {/* Arrow Shaft */}
            <mesh>
              <cylinderGeometry args={[0.008, 0.008, 0.65, 8]} />
              <meshStandardMaterial color={p.accentNeon} emissive={p.accentNeon} emissiveIntensity={1.8} />
            </mesh>
            {/* Arrow Plasma Broadhead Tip */}
            <mesh position={[0, 0.35, 0]}>
              <coneGeometry args={[0.03, 0.09, 6]} />
              <meshStandardMaterial color="#ffffff" emissive={effectiveGlow} emissiveIntensity={3.0} />
            </mesh>
            {/* Plasma Fletching */}
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[0.05, 0.08, 0.01]} />
              <meshStandardMaterial color={p.glowEnergy} emissive={p.glowEnergy} emissiveIntensity={2.5} />
            </mesh>
          </group>
        </group>

        {/* ============================================================ */}
        {/* DEFENSIVE PLASMA BUCKLER SHIELD (K / BLOCK)                 */}
        {/* ============================================================ */}
        <mesh ref={shieldRef} position={[0, -0.35, 0.25]} rotation={[0, 0, 0]} visible={false}>
          <ringGeometry args={[0.3, 0.7, 6]} />
          <meshBasicMaterial color={p.shieldColor} transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 4. RIGHT ARM (DRAW ARM)                                        */}
      {/* ============================================================== */}
      <group ref={rightArmRef} position={[0.35, 1.2, 0]}>
        {/* Shoulder Pauldron */}
        <mesh position={[0.04, 0.05, 0]}>
          <boxGeometry args={[0.15, 0.16, 0.18]} />
          <meshStandardMaterial color={hitColor || p.armorPlates} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Upper Arm */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.06, 0.22, 10]} />
          <meshStandardMaterial color={hitColor || p.suitBase} roughness={0.5} />
        </mesh>
        {/* Forearm & Bracer */}
        <mesh position={[0, -0.36, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.22, 10]} />
          <meshStandardMaterial color={hitColor || p.armorPlates} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.48, 0]}>
          <boxGeometry args={[0.07, 0.08, 0.07]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 5. LEGS & BIONIC STEALTH BOOTS                                 */}
      {/* ============================================================== */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.14, 0.8, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.32, 10]} />
          <meshStandardMaterial color={hitColor || p.suitBase} roughness={0.6} />
        </mesh>
        {/* Knee Armor Plate */}
        <mesh position={[0, -0.34, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.06]} />
          <meshStandardMaterial color={p.armorPlates} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Shin Greave */}
        <mesh position={[0, -0.5, 0.01]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.32, 12]} />
          <meshStandardMaterial color={hitColor || p.armorPlates} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Stealth Boot Foot */}
        <mesh position={[0, -0.68, 0.06]} castShadow>
          <boxGeometry args={[0.11, 0.09, 0.22]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.5} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.14, 0.8, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.32, 10]} />
          <meshStandardMaterial color={hitColor || p.suitBase} roughness={0.6} />
        </mesh>
        {/* Knee Armor Plate */}
        <mesh position={[0, -0.34, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.06]} />
          <meshStandardMaterial color={p.armorPlates} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Shin Greave */}
        <mesh position={[0, -0.5, 0.01]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.32, 12]} />
          <meshStandardMaterial color={hitColor || p.armorPlates} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Stealth Boot Foot */}
        <mesh position={[0, -0.68, 0.06]} castShadow>
          <boxGeometry args={[0.11, 0.09, 0.22]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.5} />
        </mesh>
      </group>

      {/* Ground Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.45} />
      </mesh>
    </group>
  );
};

export default ArcherCharacter3D;
