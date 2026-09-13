import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FoxCharacter3D } from '../3d/FoxCharacter3D';
import { ArcherCharacter3D } from '../3d/ArcherCharacter3D';
import { useCostumeStore } from '../../store/costumeStore';

interface PlayerPreviewModelProps {
  glowColor?: string;
  isMelee?: boolean;
  selectedStyle?: 'melee' | 'archery' | 'wrestling' | 'defense' | 'sword';
}

const PlayerPreviewModel: React.FC<PlayerPreviewModelProps> = ({ isMelee = true, selectedStyle }) => {
  const groupRef = useRef<THREE.Group>(null);
  const selectedCostume = useCostumeStore((s) => s.selectedCostume);
  const isArcher = selectedStyle === 'archery' || !isMelee;

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle floating and breathing
      groupRef.current.position.y = -0.78 + Math.sin(t * 2.2) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.78, 0]}>
      {isArcher ? (
        <ArcherCharacter3D costume={selectedCostume} />
      ) : (
        <FoxCharacter3D
          variant="fox"
          costume={selectedCostume}
          weapon={selectedStyle === 'sword' ? 'sword' : 'melee'}
        />
      )}
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
    <group position={[0, -0.92, 0]}>
      {/* Cylindrical Base Platform — stands upright flat on the floor */}
      <mesh position={[0, -0.07, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.65, 0.14, 48]} />
        <meshStandardMaterial color="#080d1a" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Top Pedestal Bevel Trim */}
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[1.42, 1.48, 0.02, 48]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Outer Glowing Neon Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.32, 1.40, 48]} />
        <meshBasicMaterial color={glowColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Center Target Marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.38, 0.44, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const ShadowMapFix: React.FC = () => {
  const { gl } = useThree();

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFShadowMap;
  }, [gl]);

  return null;
};

interface PlayerPreview3DProps {
  glowColor?: string;
  isMelee?: boolean;
  selectedStyle?: 'melee' | 'archery' | 'wrestling' | 'defense' | 'sword';
}

export const PlayerPreview3D: React.FC<PlayerPreview3DProps> = ({
  glowColor = '#00f0ff',
  isMelee = true,
  selectedStyle,
}) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0.25, 3.6], fov: 40 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ShadowMapFix />
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.8} color={glowColor} />
        <pointLight position={[0, 1.8, 2.5]} intensity={1.8} color="#ffffff" distance={8} />
        <pointLight position={[-2, 0.5, 1.5]} intensity={2.5} color={glowColor} distance={6} />
        <pointLight position={[2, 0.5, 1.5]} intensity={1.8} color="#9d4edd" distance={6} />

        <PedestalStage glowColor={glowColor} />
        <PlayerPreviewModel glowColor={glowColor} isMelee={isMelee} selectedStyle={selectedStyle} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          target={[0, 0.02, 0]}
          autoRotate={true}
          autoRotateSpeed={1.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2 + 0.05}
        />
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
