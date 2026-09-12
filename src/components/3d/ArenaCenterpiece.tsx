import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const ArenaCenterpiece: React.FC = () => {
  const crystalRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.5;
      crystalRef.current.position.y = 28 + Math.sin(state.clock.elapsedTime * 2) * 0.8;
    }
  });

  return (
    <group position={[0, 0, -30]}>
      <mesh position={[0, 15, 0]} castShadow>
        <boxGeometry args={[4, 30, 4]} />
        <meshStandardMaterial color="#f0f3f8" roughness={0.2} metalness={0.1} />
      </mesh>

      <mesh position={[0, 34, 0]}>
        <coneGeometry args={[3, 8, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>

      <mesh ref={crystalRef} position={[0, 28, 0]} castShadow>
        <octahedronGeometry args={[2.5, 0]} />
        <MeshWobbleMaterial
          color="#00d2ff"
          emissive="#0099ff"
          emissiveIntensity={2}
          roughness={0.1}
          factor={0.7}
          speed={2}
        />
      </mesh>

      <pointLight position={[0, 28, 0]} color="#00d2ff" intensity={3} distance={25} />

      <mesh position={[-4.5, 26, 0]} rotation={[0, 0, -0.2]} castShadow>
        <boxGeometry args={[1, 12, 2]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      <mesh position={[4.5, 26, 0]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[1, 12, 2]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {[-35, 35].map((xOffset, idx) => (
        <group key={idx} position={[xOffset, 10, -10]}>
          <mesh position={[0, 5, 0]} castShadow>
            <cylinderGeometry args={[5, 6, 20, 16]} />
            <meshStandardMaterial color="#d1d5db" />
          </mesh>

          <mesh position={[0, 16, 0]}>
            <sphereGeometry args={[5.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
