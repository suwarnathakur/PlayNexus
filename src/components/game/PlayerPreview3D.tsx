import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FoxCharacter3D } from '../3d/FoxCharacter3D';

interface PlayerPreviewModelProps {
  glowColor?: string;
  isMelee?: boolean;
}

const PlayerPreviewModel: React.FC<PlayerPreviewModelProps> = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle floating and smooth rotation showcasing Fox McCloud from all angles
      groupRef.current.position.y = 0.12 + Math.sin(t * 2.4) * 0.03;
      groupRef.current.rotation.y = Math.sin(t * 0.6) * 0.45;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.12, 0]}>
      <FoxCharacter3D variant="fox" />
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
