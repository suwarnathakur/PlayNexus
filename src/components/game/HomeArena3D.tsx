import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import { ArenaCenterpiece } from '../3d/ArenaCenterpiece';
import { ArenaStadium } from '../3d/ArenaStadium';

interface FighterSilhouetteProps {
  position: [number, number, number];
  isAi?: boolean;
  glowColor: string;
  baseColor: string;
}

/**
 * Humanoid fighter silhouette using simple geometric primitives
 */
const FighterSilhouette: React.FC<FighterSilhouetteProps> = ({
  position,
  isAi = false,
  glowColor,
  baseColor,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Subtle combat idle stance sway and breathing
      groupRef.current.position.y = position[1] + Math.sin(t * 2.8 + (isAi ? 1.4 : 0)) * 0.06;
      groupRef.current.rotation.z = Math.sin(t * 1.4 + (isAi ? 0.8 : 0)) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Head */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={baseColor} roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Visor Eye Glow */}
      <mesh position={[isAi ? -0.16 : 0.16, 1.72, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.24]} />
        <meshBasicMaterial color={glowColor} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.48, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.14, 12]} />
        <meshStandardMaterial color="#0b0e14" />
      </mesh>

      {/* Chest & Torso */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <boxGeometry args={[0.65, 0.65, 0.38]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Glowing Core Reactor */}
      <mesh position={[isAi ? -0.34 : 0.34, 1.18, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={glowColor} />
      </mesh>

      {/* Abdomen / Waist */}
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.32, 16]} />
        <meshStandardMaterial color="#080b10" roughness={0.6} metalness={0.7} />
      </mesh>

      {/* Left Guard Arm (Forward Fist) */}
      <mesh position={[isAi ? -0.28 : 0.28, 1.1, isAi ? -0.25 : 0.25]} rotation={[0.4, isAi ? -0.5 : 0.5, 0]}>
        <boxGeometry args={[0.18, 0.45, 0.18]} />
        <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Left Forearm / Fist */}
      <mesh position={[isAi ? -0.42 : 0.42, 1.28, isAi ? -0.15 : 0.15]}>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial color={glowColor} roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Right Guard Arm */}
      <mesh position={[0, 1.05, isAi ? 0.32 : -0.32]}>
        <boxGeometry args={[0.18, 0.48, 0.18]} />
        <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[isAi ? 0.14 : -0.14, 0.32, 0.14]}>
        <boxGeometry args={[0.2, 0.64, 0.2]} />
        <meshStandardMaterial color="#080b10" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[isAi ? -0.18 : 0.18, 0.32, -0.14]}>
        <boxGeometry args={[0.2, 0.64, 0.2]} />
        <meshStandardMaterial color="#080b10" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Ground Shadow Disc */}
      <mesh position={[0, -position[1] + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

/**
 * Central winged spire, fantasy stadium seating, and grand colosseum geometry
 */
const WingedSpire: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      <mesh position={[0, 5.8, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.7, 12.5, 32]} />
        <meshStandardMaterial color="#f3f7ff" metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh position={[0, 11.5, 0]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial color="#cfe3ff" emissive="#89d7ff" emissiveIntensity={1.2} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[0, 6.8, 0]} rotation={[0, 0, side * 0.18]}>
          <mesh position={[side * 8.5, 0.6, 0]} rotation={[0, 0, side * -0.45]} castShadow>
            <boxGeometry args={[0.4, 8.4, 4.4]} />
            <meshStandardMaterial color="#f7fbff" metalness={0.85} roughness={0.2} />
          </mesh>

          <mesh position={[side * 12.5, 1.2, 0]} rotation={[0, 0, side * -0.7]} castShadow>
            <boxGeometry args={[0.32, 6.4, 3.2]} />
            <meshStandardMaterial color="#e5efff" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const StadiumSeating: React.FC = () => {
  const seats = React.useMemo(() => {
    const rows: React.ReactNode[] = [];
    for (let row = 0; row < 8; row++) {
      const radius = 15 + row * 2.5;
      const count = 26 + row * 3;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 0.8 + row * 0.28;
        rows.push(
          <mesh
            key={`${row}-${i}`}
            position={[x, y, z]}
            rotation={[0, -angle + Math.PI / 2, 0]}
            castShadow
          >
            <boxGeometry args={[0.9, 0.45, 0.9]} />
            <meshStandardMaterial color={row % 2 === 0 ? '#f2e6d2' : '#d9c7b2'} roughness={0.9} />
          </mesh>
        );
      }
    }
    return rows;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.35, 0]}>
        <ringGeometry args={[15, 23, 96]} />
        <meshStandardMaterial color="#efe2ce" roughness={0.9} />
      </mesh>
      {seats}
    </group>
  );
};

const ArenaStage: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[7.5, 8.2, 0.4, 64]} />
        <meshStandardMaterial color="#d6b38f" roughness={0.8} metalness={0.1} />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.11, 0]}>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color="#d4b28c" roughness={0.8} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[6.4, 6.6, 64]} />
        <meshBasicMaterial color="#59d2ff" side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[3.6, 3.75, 48]} />
        <meshBasicMaterial color="#ff0055" side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[1.2, 1.3, 32]} />
        <meshBasicMaterial color="#9d4edd" side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>

      <gridHelper args={[16, 16, '#00f0ff', '#162238']} position={[0, 0.22, 0]} />
      <StadiumSeating />
      <WingedSpire />
      <ArenaCenterpiece />
    </group>
  );
};

/**
 * Smooth cinematic camera controller
 */
const CinematicCamera: React.FC<{ mouseX: number; mouseY: number }> = ({ mouseX, mouseY }) => {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Gentle cinematic sway + subtle mouse parallax
    const targetX = Math.sin(t * 0.22) * 0.6 + mouseX * 0.8;
    const targetY = 2.4 + Math.cos(t * 0.18) * 0.15 + mouseY * 0.4;
    const targetZ = 6.8 + Math.sin(t * 0.14) * 0.3;

    state.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.04);
    state.camera.lookAt(0, 1.2, 0);
  });

  return null;
};

interface HomeArena3DProps {
  parallaxX?: number;
  parallaxY?: number;
}

export const HomeArena3D: React.FC<HomeArena3DProps> = ({ parallaxX = 0, parallaxY = 0 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 45, 90], fov: 50 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <Sky sunPosition={[100, 40, 100]} inclination={0.6} azimuth={0.25} />
        <fog attach="fog" args={['#c8d6e5', 80, 250]} />

        <ambientLight intensity={0.75} />
        <directionalLight
          position={[50, 80, 50]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <pointLight position={[-4, 2.8, 1.5]} intensity={3.5} color="#00f0ff" distance={9} />
        <pointLight position={[4, 2.8, 1.5]} intensity={3.5} color="#ff0055" distance={9} />
        <pointLight position={[0, 4, 0]} intensity={1.2} color="#9d4edd" distance={8} />

        {/* Camera Controller */}
        <CinematicCamera mouseX={parallaxX} mouseY={parallaxY} />

        {/* 3D Elements */}
        <ArenaStage />
        <ArenaStadium />

        {/* Player Fighter Silhouette (Left) */}
        <FighterSilhouette
          position={[-2.1, 0.22, 0]}
          baseColor="#0f172a"
          glowColor="#00f0ff"
        />

        {/* AI Opponent Fighter Silhouette (Right) */}
        <FighterSilhouette
          position={[2.1, 0.22, 0]}
          baseColor="#1c0e24"
          glowColor="#ff3366"
          isAi
        />
      </Canvas>
    </div>
  );
};
