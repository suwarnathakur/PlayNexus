import * as THREE from 'three';

export const ArenaStadium = () => {
  return (
    <group position={[0, 0, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0, 32, 64]} />
        <meshStandardMaterial color="#d4b28c" roughness={0.9} />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[32, 35, 64]} />
        <meshStandardMaterial color="#9c826b" roughness={0.7} />
      </mesh>



      {[0, 1, 2, 3, 4].map((tier) => {
        const innerRadius = 36 + tier * 5;
        const outerRadius = 40 + tier * 5;
        const height = 3 + tier * 3.5;

        return (
          <group key={tier}>
            <mesh position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[innerRadius, outerRadius, 64]} />
              <meshStandardMaterial 
                color={tier % 2 === 0 ? '#b8a99a' : '#aa9988'} 
                side={THREE.DoubleSide} 
              />
            </mesh>
          </group>
        );
      })}

      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 33.5;
        const z = Math.sin(rad) * 33.5;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.75, 0]}>
              <boxGeometry args={[2.2, 1.5, 2.2]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>

            <mesh position={[0, 8, 0]}>
              <cylinderGeometry args={[0.9, 1.1, 13, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.15} />
            </mesh>

            <mesh position={[0, 15, 0]}>
              <boxGeometry args={[2.4, 1.2, 2.4]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      {[-120, -60, 60, 120].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 58;
        const z = Math.sin(rad) * 58;
        return (
          <group key={i} position={[x, 18, z]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[3.5, 4, 16, 16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.2} />
            </mesh>
            <mesh position={[0, 10, 0]}>
              <sphereGeometry args={[3.7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
