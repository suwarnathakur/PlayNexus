import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import { ArenaCenterpiece } from '../3d/ArenaCenterpiece';
import { ArenaStadium } from '../3d/ArenaStadium';

import { FoxCharacter3D } from '../3d/FoxCharacter3D';

interface FighterSilhouetteProps {
  position: [number, number, number];
  isAi?: boolean;
  glowColor?: string;
  baseColor?: string;
}

/**
 * 3D Fox McCloud vs Falco Lombardi showcase fighters in the background Colosseum
 */
const FighterSilhouette: React.FC<FighterSilhouetteProps> = ({
  position,
  isAi = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Subtle combat idle stance sway and breathing
      groupRef.current.position.y = position[1] + Math.sin(t * 2.8 + (isAi ? 1.4 : 0)) * 0.04;
      groupRef.current.rotation.y =
        (isAi ? -Math.PI / 2 : Math.PI / 2) + Math.sin(t * 1.4 + (isAi ? 0.8 : 0)) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, isAi ? -Math.PI / 2 : Math.PI / 2, 0]}>
      <FoxCharacter3D variant={isAi ? 'falco' : 'fox'} />
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
      <mesh receiveShadow position={[0, 0, 0]}>
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
 * Floating 3D cyber dust / sparks with mobile optimization
 */
const CyberParticles3D: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const count = isMobile ? 28 : 70;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, [count]);

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
 * Smooth cinematic camera controller with reduced-motion support
 */
const CinematicCamera: React.FC<{ mouseX: number; mouseY: number }> = ({ mouseX, mouseY }) => {
  useFrame((state) => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      state.camera.position.set(0, 2.4, 7);
      state.camera.lookAt(0, 1.2, 0);
      return;
    }

    const t = state.clock.getElapsedTime();
    // Gentle cinematic sway + subtle mouse parallax
    const targetX = Math.sin(t * 0.22) * 0.5 + mouseX * 0.6;
    const targetY = 2.4 + Math.cos(t * 0.18) * 0.12 + mouseY * 0.3;
    const targetZ = 6.8 + Math.sin(t * 0.14) * 0.25;

    state.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.04);
    state.camera.lookAt(0, 1.2, 0);
  });

  return null;
};

const ShadowMapFix: React.FC = () => {
  const { gl } = useThree();

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFShadowMap;
  }, [gl]);

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
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'high-performance', antialias: true }}
        camera={{ position: [0, 45, 90], fov: 50 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ShadowMapFix />
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
        <CyberParticles3D />
        <ArenaStage />
        <ArenaStadium />

        {/* Player Fighter Silhouette (Left) */}
        <FighterSilhouette
          position={[-2.1, 0.22, 0]}
          baseColor="#e2e8f0"
          glowColor="#00f0ff"
        />

        {/* AI Opponent Fighter Silhouette (Right) */}
        <FighterSilhouette
          position={[2.1, 0.22, 0]}
          baseColor="#dc2626"
          glowColor="#ff0055"
          isAi
        />
      </Canvas>
    </div>
  );
};
