import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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
 * Sweeping Hologram AI Scanning Laser Beam
 */
const AIScanningBeam: React.FC = () => {
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (beamRef.current) {
      const t = state.clock.getElapsedTime();
      beamRef.current.position.x = Math.sin(t * 1.6) * 3.2;
    }
  });

  return (
    <mesh ref={beamRef} position={[0, 1.2, 0]} rotation={[0, 0, 0]}>
      <planeGeometry args={[0.06, 3.5]} />
      <meshBasicMaterial
        color="#00f0ff"
        transparent
        opacity={0.45}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * 3D Arena Stage with glowing boundary rings and depth grid
 */
const ArenaStage: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Center Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[7.5, 8.2, 0.4, 48]} />
        <meshStandardMaterial color="#070a10" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Outer Cyan Combat Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[6.4, 6.6, 64]} />
        <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} />
      </mesh>

      {/* Inner Danger Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[3.6, 3.75, 48]} />
        <meshBasicMaterial color="#ff0055" side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>

      {/* Center AI Target Emblem */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[1.2, 1.3, 32]} />
        <meshBasicMaterial color="#9d4edd" side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>

      {/* Perspective Stage Depth Grid */}
      <gridHelper args={[16, 16, '#00f0ff', '#162238']} position={[0, 0.22, 0]} />
    </group>
  );
};

/**
 * Floating 3D cyber dust / sparks
 */
const CyberParticles3D: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 75;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const t = state.clock.getElapsedTime();
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        // Slow vertical ascent with gentle sway
        pos[i * 3 + 1] += 0.008;
        pos[i * 3] += Math.sin(t * 0.8 + i) * 0.003;
        if (pos[i * 3 + 1] > 6) {
          pos[i * 3 + 1] = 0.2;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#00f0ff"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
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
        camera={{ position: [0, 2.4, 7], fov: 44 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        {/* Fog to blend into deep dark background */}
        <fog attach="fog" args={['#05070c', 4, 18]} />

        {/* Ambient & Key Combat Stage Lighting */}
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[4, 8, 4]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Player Cyan Key Rim Light */}
        <pointLight position={[-4, 2.8, 1.5]} intensity={3.5} color="#00f0ff" distance={9} />

        {/* AI Opponent Crimson Key Rim Light */}
        <pointLight position={[4, 2.8, 1.5]} intensity={3.5} color="#ff0055" distance={9} />

        {/* Center Arena Highlight */}
        <pointLight position={[0, 4, 0]} intensity={1.2} color="#9d4edd" distance={8} />

        {/* Camera Controller */}
        <CinematicCamera mouseX={parallaxX} mouseY={parallaxY} />

        {/* 3D Elements */}
        <ArenaStage />
        <CyberParticles3D />
        <AIScanningBeam />

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
