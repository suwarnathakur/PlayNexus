import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerPreviewModelProps {
  glowColor?: string;
  isMelee?: boolean;
}

const PlayerPreviewModel: React.FC<PlayerPreviewModelProps> = ({
  glowColor = '#00f0ff',
  isMelee = true,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle floating/breathing animation
      groupRef.current.position.y = 0.15 + Math.sin(t * 2.6) * 0.05;
      // Gentle auto-rotation
      groupRef.current.rotation.y = Math.sin(t * 0.7) * 0.35;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.15, 0]}>
      {/* Head */}
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.24, 20, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Cyber Visor Glow */}
      <mesh position={[0, 1.74, 0.2]}>
        <boxGeometry args={[0.3, 0.09, 0.1]} />
        <meshBasicMaterial color={glowColor} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.46, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.14, 16]} />
        <meshStandardMaterial color="#080b10" />
      </mesh>

      {/* Chest Armor Plate */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.7, 0.68, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Chest Reactor Light */}
      <mesh position={[0, 1.15, 0.22]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={glowColor} />
      </mesh>

      {/* Belt / Pelvis */}
      <mesh position={[0, 0.66, 0]}>
        <cylinderGeometry args={[0.24, 0.28, 0.32, 16]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Left Guard Arm & Fist */}
      <mesh position={[-0.38, 1.05, 0.2]} rotation={[0.4, 0.3, -0.2]}>
        <boxGeometry args={[0.18, 0.46, 0.18]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Left Glowing Combat Knuckle */}
      <mesh position={[-0.42, 1.25, 0.4]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshStandardMaterial color={isMelee ? glowColor : '#64748b'} roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Right Guard Arm & Fist */}
      <mesh position={[0.38, 1.05, 0.2]} rotation={[0.4, -0.3, 0.2]}>
        <boxGeometry args={[0.18, 0.46, 0.18]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Right Glowing Combat Knuckle */}
      <mesh position={[0.42, 1.25, 0.4]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshStandardMaterial color={isMelee ? glowColor : '#64748b'} roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.18, 0.3, 0]}>
        <boxGeometry args={[0.22, 0.65, 0.22]} />
        <meshStandardMaterial color="#080b10" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.18, 0.3, 0]}>
        <boxGeometry args={[0.22, 0.65, 0.22]} />
        <meshStandardMaterial color="#080b10" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Ground Shadow */}
      <mesh position={[0, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

/**
 * Pedestal Ring with rotation
 */
const PedestalStage: React.FC<{ glowColor: string }> = ({ glowColor }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <group position={[0, -0.14, 0]}>
      {/* Cylindrical Base Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 0.24, 32]} />
        <meshStandardMaterial color="#060911" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Outer Glowing Neon Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.13, 0]}>
        <ringGeometry args={[1.35, 1.42, 32]} />
        <meshBasicMaterial color={glowColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Center Target Marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.13, 0]}>
        <ringGeometry args={[0.4, 0.46, 24]} />
        <meshBasicMaterial color="rgba(255,255,255,0.4)" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

interface PlayerPreview3DProps {
  glowColor?: string;
  isMelee?: boolean;
}

export const PlayerPreview3D: React.FC<PlayerPreview3DProps> = ({
  glowColor = '#00f0ff',
  isMelee = true,
}) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '340px', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.3, 3.4], fov: 42 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 5, 3]} intensity={1.8} castShadow />
        <pointLight position={[-2.5, 2, 2]} intensity={3} color={glowColor} distance={6} />
        <pointLight position={[2.5, 2, -1]} intensity={1.5} color="#9d4edd" distance={6} />

        <PedestalStage glowColor={glowColor} />
        <PlayerPreviewModel glowColor={glowColor} isMelee={isMelee} />
      </Canvas>

      {/* Hologram Scan Watermark Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.68rem',
          color: glowColor,
          letterSpacing: '0.14em',
          background: 'rgba(5, 8, 15, 0.8)',
          border: `1px solid ${glowColor}40`,
          padding: '3px 12px',
          borderRadius: '12px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        3D HOLO-MODEL // ROTATION: ACTIVE
      </div>
    </div>
  );
};
