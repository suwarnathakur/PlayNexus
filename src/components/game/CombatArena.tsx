import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { CombatHUD } from './CombatHUD';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useSound } from '../../hooks/useSound';
import { AIController } from '../../game/AI/AIController';
import type { AIStateType } from '../../game/AI/AIState';
import { TelemetryCollector } from '../../game/telemetry/TelemetryCollector';
import type { DodgeDirection } from '../../game/telemetry/TelemetryTypes';
import { TelemetryDebugPanel } from './TelemetryDebugPanel';
import { useTelemetryStore } from '../../store/telemetryStore';
import { AdaptiveAI, type AdaptiveTacticalEvent } from '../../ai/adaptive/AdaptiveAI';
import { StrategyEngine } from '../../ai/adaptive/StrategyEngine';
import { AdaptiveAIHUD } from './AdaptiveAIHUD';
import { DodgeLockManager } from '../../game/locks/DodgeLockManager';
import type { DodgeLockEvent } from '../../game/locks/DodgeLockTypes';
import { DodgeLockOverlay } from './DodgeLockOverlay';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { useDemoStore } from '../../demo/demoStore';
import { DEMO_COUNTER_STRATEGY } from '../../demo/demoData';
import { useCostumeStore, type CombatStyle, type StageTheme } from '../../store/costumeStore';

import { FoxCharacter3D } from '../3d/FoxCharacter3D';
import { ArcherCharacter3D } from '../3d/ArcherCharacter3D';

const ARENA_RADIUS = 6.2;
const MOVEMENT_SPEED = 5.2;
const ATTACK_RANGE = 2.2;
const PLAYER_MAX_HP = 100;
const ENEMY_MAX_HP = 100;

/**
 * Arena Game Loop Tick Helper (ticks DodgeLockManager, buffs, and challenge countdowns)
 */
const ArenaGameLoop: React.FC<{ onUpdate: (delta: number) => void }> = ({ onUpdate }) => {
  useFrame((_, delta) => onUpdate(Math.min(delta, 0.1)));
  return null;
};

/**
 * 3D Hit Spark / Impact Effect
 */
interface HitSparkProps {
  position: [number, number, number];
  color: string;
}

const HitSpark: React.FC<HitSparkProps> = ({ position, color }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.scale.addScalar(delta * 4.5);
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, mat.opacity - delta * 3.5);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.2, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
};

/**
 * Arwing Laser Bolt — animated 3D projectile fired on Special Attack
 */
interface LaserBoltProps {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
}

const LaserBolt: React.FC<LaserBoltProps> = ({ from, to, color = '#ff4444' }) => {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const fromVec = new THREE.Vector3(...from);
  const toVec = new THREE.Vector3(...to);
  const dir = new THREE.Vector3().subVectors(toVec, fromVec);
  const len = dir.length();

  useFrame((_, delta) => {
    if (!ref.current) return;
    progress.current += delta * 8;
    const t = Math.min(progress.current, 1);
    const pos = fromVec.clone().lerp(toVec, t);
    ref.current.position.copy(pos);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 1 - t * 1.2);
    ref.current.scale.setScalar(1 - t * 0.6);
  });

  // Orient capsule along direction
  const quaternion = new THREE.Quaternion();
  const axis = new THREE.Vector3(0, 1, 0);
  quaternion.setFromUnitVectors(axis, dir.clone().normalize());

  return (
    <mesh ref={ref} position={from} quaternion={quaternion}>
      <capsuleGeometry args={[0.06, len * 0.5, 4, 8]} />
      <meshBasicMaterial color={color} transparent opacity={1} />
    </mesh>
  );
};

/**
 * High-Velocity Plasma Arrow Projectile Entity
 */
export interface PlasmaArrowData {
  id: number;
  start: [number, number, number];
  dir: [number, number, number];
  speed: number;
  color: string;
  damage: number;
  isSpecial?: boolean;
  isFromEnemy?: boolean;
}

const PlasmaArrowMesh: React.FC<{
  arrow: PlasmaArrowData;
  onImpact: (arrowId: number, hitPos?: [number, number, number], isFromEnemy?: boolean) => void;
  enemyPosRef: React.MutableRefObject<THREE.Vector3>;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
}> = ({ arrow, onImpact, enemyPosRef, playerPosRef }) => {
  const meshRef = useRef<THREE.Group>(null);
  const curPos = useRef(new THREE.Vector3(...arrow.start));
  const dirVec = useMemo(() => new THREE.Vector3(...arrow.dir).normalize(), [arrow.dir]);
  const life = useRef(0);
  const maxLife = 1.4;
  const hasImpacted = useRef(false);

  useFrame((_, delta) => {
    if (!meshRef.current || hasImpacted.current) return;
    life.current += delta;
    if (life.current > maxLife) {
      hasImpacted.current = true;
      onImpact(arrow.id, undefined, arrow.isFromEnemy);
      return;
    }

    curPos.current.addScaledVector(dirVec, arrow.speed * delta);
    meshRef.current.position.copy(curPos.current);

    if (arrow.isFromEnemy) {
      // Check collision against Player hitbox
      const distToPlayer = curPos.current.distanceTo(
        new THREE.Vector3(playerPosRef.current.x, playerPosRef.current.y + 0.8, playerPosRef.current.z)
      );
      if (distToPlayer < 1.3) {
        hasImpacted.current = true;
        onImpact(arrow.id, [curPos.current.x, curPos.current.y, curPos.current.z], true);
      }
    } else {
      // Check collision against Enemy hitbox
      const distToEnemy = curPos.current.distanceTo(
        new THREE.Vector3(enemyPosRef.current.x, enemyPosRef.current.y + 0.8, enemyPosRef.current.z)
      );
      if (distToEnemy < 1.3) {
        hasImpacted.current = true;
        onImpact(arrow.id, [curPos.current.x, curPos.current.y, curPos.current.z], false);
      }
    }
  });

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dirVec);
    return q;
  }, [dirVec]);

  return (
    <group ref={meshRef} position={arrow.start} quaternion={quaternion}>
      {/* High-energy plasma beam shaft */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 1.15, 8]} />
        <meshBasicMaterial color={arrow.color} transparent opacity={0.95} />
      </mesh>
      {/* Arrow Broadhead Emitter */}
      <mesh position={[0, 0, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.075, 0.22, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Trailing Particle Core */}
      <mesh position={[0, 0, -0.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={arrow.color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

/**
 * Holographic Archery Crosshair Lock on Enemy
 */
const SniperCrosshair: React.FC<{ targetPos: React.MutableRefObject<THREE.Vector3> }> = ({ targetPos }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.set(targetPos.current.x, targetPos.current.y + 1.1, targetPos.current.z);
      groupRef.current.rotation.z += delta * 2.2;
      const t = state.clock.getElapsedTime();
      const pulse = 1.0 + Math.sin(t * 8) * 0.08;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <ringGeometry args={[0.42, 0.48, 24]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
      {/* Reticle ticks */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[0.03, 0.12, 0.01]} />
        <meshBasicMaterial color="#c084fc" />
      </mesh>
      <mesh position={[0, -0.52, 0]}>
        <boxGeometry args={[0.03, 0.12, 0.01]} />
        <meshBasicMaterial color="#c084fc" />
      </mesh>
      <mesh position={[-0.52, 0, 0]}>
        <boxGeometry args={[0.12, 0.03, 0.01]} />
        <meshBasicMaterial color="#c084fc" />
      </mesh>
      <mesh position={[0.52, 0, 0]}>
        <boxGeometry args={[0.12, 0.03, 0.01]} />
        <meshBasicMaterial color="#c084fc" />
      </mesh>
      {/* Center lock pip */}
      <mesh>
        <circleGeometry args={[0.04, 12]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
    </group>
  );
};

/**
 * 3D Player Fighter Component (Fox McCloud or Archer)
 */
interface PlayerFighterProps {
  position: React.MutableRefObject<THREE.Vector3>;
  enemyPosition?: React.MutableRefObject<THREE.Vector3>;
  isDead: boolean;
  isAttacking: boolean;
  isBlocking: boolean;
  isDodging: boolean;
  isHit: boolean;
  costume?: import('../../store/costumeStore').FoxCostume;
  selectedStyle?: CombatStyle;
  onPositionUpdate: (pos: [number, number, number], isMoving: boolean) => void;
}

const PlayerFighter: React.FC<PlayerFighterProps> = ({
  position,
  enemyPosition,
  isDead,
  isAttacking,
  isBlocking,
  isDodging,
  isHit,
  costume,
  selectedStyle = 'melee',
  onPositionUpdate,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const keys = useKeyboardControls();
  const targetRotation = useRef(Math.PI / 2);
  const [isMoving, setIsMoving] = useState(false);
  const wasMoving = useRef(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isDead) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -Math.PI / 2, delta * 6);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.25, delta * 6);
      return;
    } else {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 12);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 12);
    }

    // 1. Movement Input
    const moveX = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
    const moveZ = (keys.current.backward ? 1 : 0) - (keys.current.forward ? 1 : 0);
    const movingNow = (moveX !== 0 || moveZ !== 0) && !isBlocking;

    if (movingNow !== wasMoving.current) {
      wasMoving.current = movingNow;
      setIsMoving(movingNow);
    }

    if (movingNow && !isDodging) {
      const moveDir = new THREE.Vector2(moveX, moveZ).normalize();
      const speedMultiplier = isBlocking ? 0.3 : 1.0;
      const moveStep = MOVEMENT_SPEED * speedMultiplier * delta;

      const nextX = position.current.x + moveDir.x * moveStep;
      const nextZ = position.current.z + moveDir.y * moveStep;

      // Soft collision separation: do not allow moving directly inside enemy model
      if (enemyPosition) {
        const curDist = Math.hypot(position.current.x - enemyPosition.current.x, position.current.z - enemyPosition.current.z);
        const nextDist = Math.hypot(nextX - enemyPosition.current.x, nextZ - enemyPosition.current.z);
        if (nextDist >= 1.45 || nextDist > curDist) {
          position.current.x = nextX;
          position.current.z = nextZ;
        }
      } else {
        position.current.x = nextX;
        position.current.z = nextZ;
      }

      targetRotation.current = Math.atan2(moveDir.x, moveDir.y);
    }

    // 2. Arena Boundary Clamping
    const distFromCenter = Math.hypot(position.current.x, position.current.z);
    if (distFromCenter > ARENA_RADIUS) {
      const angle = Math.atan2(position.current.z, position.current.x);
      position.current.x = Math.cos(angle) * ARENA_RADIUS;
      position.current.z = Math.sin(angle) * ARENA_RADIUS;
    }

    // 3. Smooth Rotation Interpolation
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation.current,
      delta * 12
    );

    // 4. Stance Elevation (Arena floor surface is at y = 0.22; characters stand ON it)
    const t = state.clock.getElapsedTime();
    const FLOOR_Y = 0.22;
    if (isDodging) {
      position.current.y = FLOOR_Y + 0.05;
    } else if (isBlocking) {
      position.current.y = FLOOR_Y + 0.02;
    } else if (movingNow) {
      position.current.y = FLOOR_Y + 0.03 + Math.abs(Math.sin(t * 12)) * 0.04;
    } else {
      position.current.y = FLOOR_Y + 0.02 + Math.sin(t * 3) * 0.02;
    }

    groupRef.current.position.copy(position.current);
    onPositionUpdate([position.current.x, position.current.y, position.current.z], movingNow);
  });

  return (
    <group ref={groupRef} position={[-2.2, 0.2, 0]}>
      {selectedStyle === 'archery' ? (
        <ArcherCharacter3D
          isAttacking={isAttacking}
          isBlocking={isBlocking}
          isDodging={isDodging}
          isHit={isHit}
          isDead={isDead}
          isMoving={isMoving}
        />
      ) : (
        <FoxCharacter3D
          variant="fox"
          costume={costume}
          isAttacking={isAttacking}
          isBlocking={isBlocking}
          isDodging={isDodging}
          isHit={isHit}
          isDead={isDead}
          isMoving={isMoving}
        />
      )}
    </group>
  );
};

/**
 * 3D Enemy AI Fighter Component (Falco Lombardi / Rival) with Finite State Machine Updates
 */
interface EnemyFighterProps {
  position: React.MutableRefObject<THREE.Vector3>;
  playerPosition: [number, number, number];
  isDead: boolean;
  isHit: boolean;
  aiControllerRef: React.MutableRefObject<AIController>;
  enemyHp: number;
  playerHp: number;
  isPlayerAttacking: boolean;
  isPlayerBlocking: boolean;
  isPlayerDodging: boolean;
  playerComboCount: number;
  isChallengeActive: boolean;
  selectedStyle?: CombatStyle;
}

const EnemyFighter: React.FC<EnemyFighterProps> = ({
  position,
  playerPosition,
  isDead,
  isHit,
  aiControllerRef,
  enemyHp,
  playerHp,
  isPlayerAttacking,
  isPlayerBlocking,
  isPlayerDodging,
  playerComboCount,
  isChallengeActive,
  selectedStyle = 'melee',
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isMoving, setIsMoving] = useState(false);
  const wasMoving = useRef(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isDead) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.PI / 2, delta * 6);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.25, delta * 6);
      return;
    } else {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 12);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 12);
    }

    // 1. Update AI Controller (Finite State Machine Decision & Movement Tick)
    const targetPlayerPos = isChallengeActive
      ? [playerPosition[0] - 1.1, playerPosition[1], playerPosition[2]] as [number, number, number]
      : playerPosition;

    const playerVec = new THREE.Vector3(...targetPlayerPos);
    aiControllerRef.current.update(
      delta,
      position.current,
      playerVec,
      {
        enemyHp,
        enemyMaxHp: ENEMY_MAX_HP,
        playerHp,
        isPlayerAttacking,
        isPlayerBlocking,
        arenaRadius: ARENA_RADIUS,
        combatStyle: selectedStyle,
      },
      {
        isPlayerDodging,
        playerComboCount,
      }
    );

    const aiState = aiControllerRef.current.getState();
    const movingNow = aiState === 'APPROACH' || aiState === 'RETREAT';
    if (movingNow !== wasMoving.current) {
      wasMoving.current = movingNow;
      setIsMoving(movingNow);
    }

    // 2. Turn smoothly toward the player
    const angleToPlayer = Math.atan2(
      playerPosition[0] - position.current.x,
      playerPosition[2] - position.current.z
    );

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      angleToPlayer,
      delta * 5
    );

    const t = state.clock.getElapsedTime();
    const FLOOR_Y = 0.22;
    if (aiState === 'IDLE') {
      position.current.y = FLOOR_Y + 0.02 + Math.sin(t * 2.8 + 1.2) * 0.02;
    } else {
      position.current.y = FLOOR_Y + 0.02;
    }

    groupRef.current.position.copy(position.current);
  });

  const isBlocking = aiControllerRef.current.isBlocking();
  const isAttacking = aiControllerRef.current.isAttacking();
  const isDodging = aiControllerRef.current.isDodging();

  return (
    <group ref={groupRef} position={[2.5, 0.22, 0]}>
      {selectedStyle === 'archery' ? (
        <ArcherCharacter3D
          costume="red"
          isAttacking={isAttacking}
          isBlocking={isBlocking}
          isDodging={isDodging}
          isHit={isHit}
          isDead={isDead}
          isMoving={isMoving}
        />
      ) : (
        <FoxCharacter3D
          variant="falco"
          isAttacking={isAttacking}
          isBlocking={isBlocking}
          isDodging={isDodging}
          isHit={isHit}
          isDead={isDead}
          isMoving={isMoving}
        />
      )}
    </group>
  );
};

/**
 * Dynamic 3D Combat Camera — frames both fighters and avoids occlusion
 */
interface FollowCameraProps {
  playerPosition: [number, number, number];
  enemyPosition?: [number, number, number];
}

const FollowCamera: React.FC<FollowCameraProps> = ({ playerPosition, enemyPosition }) => {
  useFrame((state, delta) => {
    const ep = enemyPosition || [playerPosition[0] + 3.5, playerPosition[1], playerPosition[2]];
    const midX = (playerPosition[0] + ep[0]) * 0.5;
    const midZ = (playerPosition[2] + ep[2]) * 0.5;
    const distBetween = Math.hypot(playerPosition[0] - ep[0], playerPosition[2] - ep[2]);

    // Zoom slightly dynamically with distance between fighters
    const zoomDist = Math.max(6.5, Math.min(8.8, 5.8 + distBetween * 0.35));
    const desiredPos = new THREE.Vector3(
      midX * 0.45,
      3.2,
      midZ * 0.45 + zoomDist
    );

    state.camera.position.lerp(desiredPos, delta * 4);

    const lookTarget = new THREE.Vector3(
      midX,
      1.3,
      midZ
    );

    state.camera.lookAt(lookTarget);
  });

  return null;
};

/**
 * Floating Sunlit Atmospheric Dust Motes
 */
const SunParticles3D: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 70;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 9 + 0.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      const t = state.clock.getElapsedTime();
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(t * 0.4 + i) * 0.003;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#fbbf24"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

/**
 * Floating Bioluminescent Jungle Spores & Pollen
 */
const JungleSporeParticles3D: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 90;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = Math.random() * 8 + 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      const t = state.clock.getElapsedTime();
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(t * 0.6 + i) * 0.004;
        pos[i * 3] += Math.cos(t * 0.3 + i) * 0.002;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        color="#34d399"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

/**
 * Fighting Ground Stage with Support for Colosseum and Overgrown Cyber-Jungle Themes
 */
const PlayableArenaStage: React.FC<{ theme?: StageTheme }> = ({ theme = 'colosseum' }) => {
  const isJungle = theme === 'jungle';

  const pylonPositions = React.useMemo(() => {
    const pylons: [number, number, number][] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pylons.push([
        Math.cos(angle) * ARENA_RADIUS,
        0.5,
        Math.sin(angle) * ARENA_RADIUS,
      ]);
    }
    return pylons;
  }, []);

  // Perimeter giant ancient jungle canopy trees
  const jungleTrees = React.useMemo(() => {
    const trees: { pos: [number, number, number]; scale: number; height: number }[] = [];
    const count = 11;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.18;
      const dist = 9.2 + (i % 3) * 1.5;
      trees.push({
        pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
        scale: 0.9 + (i % 4) * 0.2,
        height: 7.5 + (i % 3) * 1.8,
      });
    }
    return trees;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Central Fighting Platform */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[ARENA_RADIUS + 0.5, ARENA_RADIUS + 1.2, 0.4, 64]} />
        <meshStandardMaterial
          color={isJungle ? '#142a1e' : '#d6b38f'}
          roughness={isJungle ? 0.9 : 0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Surrounding Vast Ground Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.11, 0]}>
        <circleGeometry args={[65, 64]} />
        <meshStandardMaterial
          color={isJungle ? '#062016' : '#d4b28c'}
          roughness={0.92}
        />
      </mesh>

      {/* Outer Boundary Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[ARENA_RADIUS - 0.14, ARENA_RADIUS + 0.14, 64]} />
        <meshStandardMaterial
          color={isJungle ? '#064e3b' : '#b58d63'}
          roughness={0.8}
        />
      </mesh>

      {/* Bioluminescent Rune Ring / Golden Martial Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.212, 0]}>
        <ringGeometry args={[ARENA_RADIUS - 0.04, ARENA_RADIUS + 0.04, 64]} />
        <meshBasicMaterial
          color={isJungle ? '#10b981' : '#eab308'}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Hazard Warning Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[3.4, 3.55, 48]} />
        <meshBasicMaterial
          color={isJungle ? '#047857' : '#dc2626'}
          side={THREE.DoubleSide}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Center Sacred Seal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[1.1, 1.25, 32]} />
        <meshBasicMaterial
          color={isJungle ? '#34d399' : '#d4af37'}
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Floor Grid Helper */}
      <gridHelper
        args={[14, 14, isJungle ? '#059669' : '#b58d63', isJungle ? '#064e3b' : '#d6b38f']}
        position={[0, 0.22, 0]}
      />

      {/* Perimeter Monoliths: Overgrown Totems (Jungle) or Marble Columns (Colosseum) */}
      {pylonPositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Base Pedestal */}
          <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.32, 0.2, 0.32]} />
            <meshStandardMaterial
              color={isJungle ? '#0f291e' : '#d4af37'}
              roughness={0.4}
              metalness={isJungle ? 0.3 : 0.8}
            />
          </mesh>
          {/* Column Shaft */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.13, 0.8, 16]} />
            <meshStandardMaterial
              color={isJungle ? '#064e3b' : '#f8fafc'}
              roughness={isJungle ? 0.8 : 0.2}
              metalness={0.15}
            />
          </mesh>
          {/* Capital Plate */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[0.26, 0.12, 0.26]} />
            <meshStandardMaterial
              color={isJungle ? '#047857' : '#d4af37'}
              roughness={0.3}
              metalness={isJungle ? 0.4 : 0.85}
            />
          </mesh>
          {/* Energy Focus Crystal Top */}
          <mesh position={[0, 0.92, 0]}>
            <sphereGeometry args={[0.085, 12, 12]} />
            <meshStandardMaterial
              color={isJungle ? '#34d399' : '#38bdf8'}
              emissive={isJungle ? '#10b981' : '#0284c7'}
              emissiveIntensity={isJungle ? 2.2 : 0.8}
            />
          </mesh>
        </group>
      ))}

      {/* ============================================================== */}
      {/* JUNGLE CANOPY TREES & FOLIAGE (RENDERED ONLY IN JUNGLE THEME)   */}
      {/* ============================================================== */}
      {isJungle &&
        jungleTrees.map((tree, i) => (
          <group key={`tree-${i}`} position={tree.pos} scale={[tree.scale, tree.scale, tree.scale]}>
            {/* Tree Trunk */}
            <mesh position={[0, tree.height * 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.72, tree.height, 10]} />
              <meshStandardMaterial color="#1c1917" roughness={0.9} />
            </mesh>
            {/* Main Canopy Foliage Dome */}
            <mesh position={[0, tree.height + 0.5, 0]} castShadow>
              <sphereGeometry args={[2.4, 12, 10]} />
              <meshStandardMaterial color="#047857" roughness={0.7} />
            </mesh>
            {/* Secondary Foliage Clump */}
            <mesh position={[0.8, tree.height + 1.2, -0.6]} castShadow>
              <sphereGeometry args={[1.8, 10, 8]} />
              <meshStandardMaterial color="#065f46" roughness={0.65} />
            </mesh>
            <mesh position={[-0.9, tree.height + 0.8, 0.7]} castShadow>
              <sphereGeometry args={[1.6, 10, 8]} />
              <meshStandardMaterial color="#059669" roughness={0.65} />
            </mesh>
            {/* Hanging Bioluminescent Spores */}
            <mesh position={[0.5, tree.height - 0.8, 0.5]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#a7f3d0" emissive="#10b981" emissiveIntensity={3.0} />
            </mesh>
            <mesh position={[-0.6, tree.height - 1.1, -0.4]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={2.5} />
            </mesh>
          </group>
        ))}
    </group>
  );
};

interface CombatArenaProps {
  onExit: () => void;
  playerCodename?: string;
}

export const CombatArena: React.FC<CombatArenaProps> = ({ onExit, playerCodename = 'CYBER_STRIKER' }) => {
  const navigate = useNavigate();
  const { playSound } = useSound();

  const keys = useKeyboardControls();

  // Positions
  const playerPosRef = useRef(new THREE.Vector3(-2.2, 0.2, 0));
  const enemyPosRef = useRef(new THREE.Vector3(2.5, 0.2, 0));
  const [playerCoordinates, setPlayerCoordinates] = useState<[number, number, number]>([-2.2, 0.2, 0]);
  const lastReportedPos = useRef<[number, number, number]>([-2.2, 0.2, 0]);
  const accumulatedMoveDist = useRef(0);

  // Health
  const [playerHp, setPlayerHp] = useState<number>(PLAYER_MAX_HP);
  const [enemyHp, setEnemyHp] = useState<number>(ENEMY_MAX_HP);

  // Player States
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isPlayerBlocking, setIsPlayerBlocking] = useState(false);
  const [isPlayerDodging, setIsPlayerDodging] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);

  // Enemy Hit Feedback & FSM State
  const [isEnemyHit, setIsEnemyHit] = useState(false);
  const [aiCurrentState, setAiCurrentState] = useState<AIStateType>('IDLE');

  // Combo & Damage feedback
  const [comboCount, setComboCount] = useState(0);
  const comboResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastDamageEvent, setLastDamageEvent] = useState<{ text: string; isCrit?: boolean; id: number } | null>(null);
  const [hitSparks, setHitSparks] = useState<{ id: number; pos: [number, number, number]; color: string }[]>([]);
  // Arwing Laser Bolts on Special
  const [laserBolts, setLaserBolts] = useState<{ id: number; from: [number, number, number]; to: [number, number, number]; color: string }[]>([]);
  // Archery Plasma Arrows
  const [arrows, setArrows] = useState<PlasmaArrowData[]>([]);

  // End of match
  const isVictory = enemyHp <= 0;
  const isDefeat = playerHp <= 0;

  // Telemetry Collector & Global Store
  const telemetryCollectorRef = useRef<TelemetryCollector>(new TelemetryCollector());
  const {
    liveEvents,
    liveMetrics,
    isDebugPanelVisible,
    fightingDNA,
    updateLiveState,
    setLatestMatch,
    clearTelemetry,
  } = useTelemetryStore();

  // Equipped Weapon from Pre-Fight Camera Scan Loadout
  const equippedWeapon = useMemo(() => {
    try {
      const stored = localStorage.getItem('playnexus_equipped_weapon');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Costume, Stage Theme & Combat Style
  const { selectedCostume, stageTheme, selectedStyle } = useCostumeStore();
  const isArchery = selectedStyle === 'archery';
  const effectiveStageTheme: StageTheme = isArchery ? 'jungle' : stageTheme;

  // Demo Mode Store State
  const {
    isDemoMode,
    demoStage,
    isLockChallengeActive,
    resolveChallengeSuccess,
    completeDemoVictory,
  } = useDemoStore();

  // Adaptive Strategy Engine derived from Fighting DNA (or Demo Mode Counter Strategy)
  const [adaptiveTacticalEvent, setAdaptiveTacticalEvent] = useState<AdaptiveTacticalEvent | null>(null);

  const adaptiveStrategy = useMemo(() => {
    if (isDemoMode && (demoStage === 'MATCH_2' || demoStage === 'LOCK_IN_CHALLENGE' || demoStage === 'DEMO_VICTORY')) {
      return DEMO_COUNTER_STRATEGY;
    }
    if (fightingDNA) {
      return StrategyEngine.generateStrategy(fightingDNA);
    }
    return StrategyEngine.getBaselineStrategy();
  }, [fightingDNA, isDemoMode, demoStage]);

  const adaptiveAIRef = useRef<AdaptiveAI>(
    new AdaptiveAI(adaptiveStrategy, (evt) => {
      setAdaptiveTacticalEvent(evt);
    })
  );

  // Sync strategy when adaptiveStrategy changes
  useEffect(() => {
    adaptiveAIRef.current.setStrategy(adaptiveStrategy);
    if (aiControllerRef.current) {
      aiControllerRef.current.setAdaptiveAI(adaptiveAIRef.current);
    }
  }, [adaptiveStrategy]);

  // Subscribe to live telemetry updates
  useEffect(() => {
    const collector = telemetryCollectorRef.current;
    const unsubscribe = collector.subscribe((_, metrics) => {
      updateLiveState([...collector.getRecentEvents(30)], metrics);
    });
    // Prime initial metrics
    updateLiveState(collector.getRecentEvents(30), collector.getLiveMetrics());
    return unsubscribe;
  }, [updateLiveState]);

  // Dodge Direction Lock Manager & State
  const dodgeLockManagerRef = useRef<DodgeLockManager>(new DodgeLockManager());
  const [dodgeLockEvent, setDodgeLockEvent] = useState<DodgeLockEvent>(
    dodgeLockManagerRef.current.getEventData()
  );

  useEffect(() => {
    const unsubscribe = dodgeLockManagerRef.current.subscribe((evt) => {
      setDodgeLockEvent(evt);
    });
    return unsubscribe;
  }, []);

  // Demo Mode Lock Challenge Listener
  useEffect(() => {
    if (isDemoMode && isLockChallengeActive) {
      dodgeLockManagerRef.current.triggerPattern('left', 'right', 83);
    }
  }, [isDemoMode, isLockChallengeActive]);

  useEffect(() => {
    if (isDemoMode && dodgeLockEvent.state === 'CHALLENGE_SUCCESS') {
      resolveChallengeSuccess();
    }
  }, [isDemoMode, dodgeLockEvent.state, resolveChallengeSuccess]);

  // Handle Match Outcome Telemetry Finalization
  useEffect(() => {
    if (isVictory || isDefeat) {
      const outcome = isVictory ? 'VICTORY' : 'DEFEAT';
      const finalMatch = telemetryCollectorRef.current.endMatch(outcome, playerHp, enemyHp);
      setLatestMatch(finalMatch);

      if (isDemoMode && isVictory) {
        if (demoStage === 'MATCH_1') {
          useDemoStore.getState().injectMatch1Results();
        } else if (demoStage === 'MATCH_2' || demoStage === 'LOCK_IN_CHALLENGE' || demoStage === 'DEMO_VICTORY') {
          completeDemoVictory();
        }
      }
    }
  }, [isVictory, isDefeat, playerHp, enemyHp, setLatestMatch, isDemoMode, demoStage, completeDemoVictory]);

  // AI Controller Ref hooked with AdaptiveAI
  const aiControllerRef = useRef<AIController>(
    new AIController({
      onAttackTrigger: () => {
        handleAIAttackStrike();
      },
      onStateChange: (newState) => {
        setAiCurrentState(newState);
      },
    }, adaptiveAIRef.current)
  );

  // Handle Player Locomotion Telemetry
  const handlePlayerPositionUpdate = (pos: [number, number, number], isMoving: boolean) => {
    setPlayerCoordinates(pos);
    if (isMoving && !isVictory && !isDefeat) {
      const dist = Math.hypot(pos[0] - lastReportedPos.current[0], pos[2] - lastReportedPos.current[2]);
      accumulatedMoveDist.current += dist;
      if (accumulatedMoveDist.current >= 1.2) {
        telemetryCollectorRef.current.recordMovement({
          distance: accumulatedMoveDist.current,
          playerHp,
        });
        accumulatedMoveDist.current = 0;
      }
    }
    lastReportedPos.current = pos;
  };

  // Enemy Attack Execution Handler
  const handleAIAttackStrike = () => {
    if (isVictory || isDefeat) return;

    // Archery Mode: AI fires a high-velocity Crimson Plasma Arrow
    if (isArchery) {
      playSound('arrow_shot');

      const startPos: [number, number, number] = [
        enemyPosRef.current.x,
        enemyPosRef.current.y + 1.1,
        enemyPosRef.current.z,
      ];
      const targetVec = new THREE.Vector3(
        playerPosRef.current.x,
        playerPosRef.current.y + 1.0,
        playerPosRef.current.z
      );
      const dirVec = new THREE.Vector3().subVectors(targetVec, new THREE.Vector3(...startPos)).normalize();

      const aiArrow: PlasmaArrowData = {
        id: Date.now() + Math.random(),
        start: startPos,
        dir: [dirVec.x, dirVec.y, dirVec.z],
        speed: 24,
        color: '#ef4444',
        damage: 15,
        isFromEnemy: true,
      };

      setArrows((prev) => [...prev.slice(-8), aiArrow]);
      return;
    }

    // Melee Mode: Close-range physical attack
    playSound('pulse');

    setTimeout(() => {
      const currentDist = playerPosRef.current.distanceTo(enemyPosRef.current);
      if (currentDist <= ATTACK_RANGE && !isVictory && !isDefeat) {
        if (isPlayerDodging) {
          // Check if AI actively intercepted the predictable dodge direction!
          if (adaptiveStrategy.counterDodge === 'COUNTER_LEFT') {
            const dmg = 12;
            setPlayerHp((hp) => {
              const nextHp = Math.max(0, hp - dmg);
              telemetryCollectorRef.current.recordDamageReceived({
                damage: dmg,
                wasBlocked: false,
                playerHp: nextHp,
                enemyHp,
              });
              return nextHp;
            });
            setIsPlayerHit(true);
            playSound('denied');
            setLastDamageEvent({ text: 'AI INTERCEPTED LEFT DODGE! -12 HP', isCrit: true, id: Date.now() });
            setTimeout(() => setIsPlayerHit(false), 200);
          } else if (adaptiveStrategy.counterDodge === 'COUNTER_RIGHT') {
            const dmg = 12;
            setPlayerHp((hp) => {
              const nextHp = Math.max(0, hp - dmg);
              telemetryCollectorRef.current.recordDamageReceived({
                damage: dmg,
                wasBlocked: false,
                playerHp: nextHp,
                enemyHp,
              });
              return nextHp;
            });
            setIsPlayerHit(true);
            playSound('denied');
            setLastDamageEvent({ text: 'AI INTERCEPTED RIGHT DODGE! -12 HP', isCrit: true, id: Date.now() });
            setTimeout(() => setIsPlayerHit(false), 200);
          } else {
            setLastDamageEvent({ text: 'AI ATTACK DODGED!', isCrit: false, id: Date.now() });
          }
        } else if (isPlayerBlocking) {
          const dmg = 4;
          setPlayerHp((hp) => {
            const nextHp = Math.max(0, hp - dmg);
            telemetryCollectorRef.current.recordDamageReceived({
              damage: dmg,
              wasBlocked: true,
              playerHp: nextHp,
              enemyHp,
            });
            return nextHp;
          });
          playSound('scan');
          setLastDamageEvent({ text: `BLOCKED ENEMY! -${dmg} HP`, isCrit: false, id: Date.now() });
        } else {
          const dmg = 14;
          setPlayerHp((hp) => {
            const nextHp = Math.max(0, hp - dmg);
            telemetryCollectorRef.current.recordDamageReceived({
              damage: dmg,
              wasBlocked: false,
              playerHp: nextHp,
              enemyHp,
            });
            return nextHp;
          });
          setIsPlayerHit(true);
          playSound('denied');
          setLastDamageEvent({ text: `ENEMY STRIKE! -${dmg} HP`, isCrit: true, id: Date.now() });
          setTimeout(() => setIsPlayerHit(false), 200);
        }
      }
    }, 200);
  };

  // Handle Plasma Arrow Impact on Enemy or Player or Expiration
  const handleArrowImpact = (arrowId: number, hitPos?: [number, number, number], isFromEnemy?: boolean) => {
    // Remove arrow from flight
    setArrows((prev) => prev.filter((a) => a.id !== arrowId));

    if (!hitPos || isVictory || isDefeat) return;

    if (isFromEnemy) {
      // Enemy Arrow impacts Player!
      if (isPlayerDodging) {
        playSound('scan');
        setLastDamageEvent({ text: 'AI ARROW DODGED!', isCrit: false, id: Date.now() });
        return;
      }

      const [hitX, hitY, hitZ] = hitPos;
      setHitSparks((prev) => [
        ...prev.slice(-6),
        { id: Date.now(), pos: [hitX, hitY, hitZ], color: '#ef4444' },
        { id: Date.now() + 1, pos: [hitX + 0.15, hitY + 0.1, hitZ - 0.15], color: '#fbbf24' },
      ]);

      if (isPlayerBlocking) {
        const dmg = 4;
        setPlayerHp((hp) => {
          const nextHp = Math.max(0, hp - dmg);
          telemetryCollectorRef.current.recordDamageReceived({
            damage: dmg,
            wasBlocked: true,
            playerHp: nextHp,
            enemyHp,
          });
          return nextHp;
        });
        playSound('scan');
        setLastDamageEvent({ text: `ENERGY SHIELD BLOCKED ARROW! -${dmg} HP`, isCrit: false, id: Date.now() });
      } else {
        const dmg = 14;
        setPlayerHp((hp) => {
          const nextHp = Math.max(0, hp - dmg);
          telemetryCollectorRef.current.recordDamageReceived({
            damage: dmg,
            wasBlocked: false,
            playerHp: nextHp,
            enemyHp,
          });
          return nextHp;
        });
        setIsPlayerHit(true);
        playSound('arrow_hit');
        playSound('denied');
        setLastDamageEvent({ text: `CRIMSON ARROW STRIKE! -${dmg} HP`, isCrit: true, id: Date.now() });
        setTimeout(() => setIsPlayerHit(false), 200);
      }
      return;
    }

    // Player arrow impacts Enemy
    playSound('arrow_hit');
    playSound('granted');

    const [hitX, hitY, hitZ] = hitPos;
    setHitSparks((prev) => [
      ...prev.slice(-6),
      { id: Date.now(), pos: [hitX, hitY, hitZ], color: '#c084fc' },
      { id: Date.now() + 1, pos: [hitX - 0.15, hitY + 0.2, hitZ + 0.15], color: '#00f0ff' },
    ]);

    const isEnemyCurrentlyBlocking = aiControllerRef.current.isBlocking();
    if (isEnemyCurrentlyBlocking) {
      const dmg = 6;
      const nextEnemyHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(nextEnemyHp);
      playSound('scan');
      setLastDamageEvent({ text: `AI DEFLECTED ARROW! -${dmg} HP`, isCrit: false, id: Date.now() });

      telemetryCollectorRef.current.recordHit({
        damage: dmg,
        combo: 1,
        playerHp,
        enemyHp: nextEnemyHp,
      });
      telemetryCollectorRef.current.recordDamageDealt({
        damage: dmg,
        playerHp,
        enemyHp: nextEnemyHp,
      });
    } else {
      const newCombo = comboCount + 1;
      setComboCount(newCombo);

      const isCrit = newCombo >= 3;
      const baseDmg = isCrit ? 28 : 18;
      const weaponMultiplier = equippedWeapon?.powerBonusPercent
        ? 1 + equippedWeapon.powerBonusPercent / 100
        : 1.0;
      const dmg = Math.round(baseDmg * weaponMultiplier);
      const nextEnemyHp = Math.max(0, enemyHp - dmg);

      setEnemyHp(nextEnemyHp);
      setIsEnemyHit(true);

      const weaponTag = equippedWeapon ? ` [${equippedWeapon.weapon.toUpperCase()}]` : '';
      setLastDamageEvent({
        text: isCrit ? `CRITICAL ARROW!${weaponTag} -${dmg} HP` : `ARROW HIT!${weaponTag} -${dmg} HP`,
        isCrit,
        id: Date.now(),
      });

      telemetryCollectorRef.current.recordHit({
        damage: dmg,
        combo: newCombo,
        playerHp,
        enemyHp: nextEnemyHp,
      });
      telemetryCollectorRef.current.recordDamageDealt({
        damage: dmg,
        playerHp,
        enemyHp: nextEnemyHp,
      });

      setTimeout(() => setIsEnemyHit(false), 200);

      if (comboResetTimer.current) clearTimeout(comboResetTimer.current);
      comboResetTimer.current = setTimeout(() => {
        setComboCount(0);
      }, 2000);
    }
  };

  // Trigger Player Attack
  const triggerPlayerAttack = () => {
    if (isPlayerAttacking || isPlayerDodging || isVictory || isDefeat) return;

    const dist = playerPosRef.current.distanceTo(enemyPosRef.current);

    // Archery: Fire Plasma Arrow Projectile
    if (isArchery) {
      setIsPlayerAttacking(true);
      playSound('arrow_shot');

      const startPos: [number, number, number] = [
        playerPosRef.current.x,
        playerPosRef.current.y + 1.1,
        playerPosRef.current.z,
      ];
      const targetVec = new THREE.Vector3(
        enemyPosRef.current.x,
        enemyPosRef.current.y + 1.0,
        enemyPosRef.current.z
      );
      const dirVec = new THREE.Vector3()
        .subVectors(targetVec, new THREE.Vector3(...startPos))
        .normalize();

      const newArrow: PlasmaArrowData = {
        id: Date.now() + Math.random(),
        start: startPos,
        dir: [dirVec.x, dirVec.y, dirVec.z],
        speed: 26,
        color: '#c084fc',
        damage: 18,
      };

      setArrows((prev) => [...prev.slice(-8), newArrow]);

      telemetryCollectorRef.current.recordAttack({
        combo: comboCount + 1,
        distanceToEnemy: dist,
        playerHp,
        enemyHp,
      });

      setTimeout(() => {
        setIsPlayerAttacking(false);
      }, 280);
      return;
    }

    // Melee / Fox McCloud: Close-Range Strike
    setIsPlayerAttacking(true);
    playSound('attack');
    playSound('pulse');

    // Record attack input telemetry
    telemetryCollectorRef.current.recordAttack({
      combo: comboCount + 1,
      distanceToEnemy: dist,
      playerHp,
      enemyHp,
    });

    setTimeout(() => {
      if (dist <= ATTACK_RANGE && !isVictory && !isDefeat) {
        const hitX = (playerPosRef.current.x + enemyPosRef.current.x) / 2;
        const hitZ = (playerPosRef.current.z + enemyPosRef.current.z) / 2;

        setHitSparks((prev) => [...prev.slice(-6), { id: Date.now(), pos: [hitX, 1.1, hitZ], color: '#00f0ff' }]);

        const isEnemyCurrentlyBlocking = aiControllerRef.current.isBlocking();

        if (isEnemyCurrentlyBlocking) {
          const dmg = 5;
          const nextEnemyHp = Math.max(0, enemyHp - dmg);
          setEnemyHp(nextEnemyHp);
          playSound('scan');
          setLastDamageEvent({ text: `AI BLOCKED! -${dmg} HP`, isCrit: false, id: Date.now() });

          telemetryCollectorRef.current.recordHit({
            damage: dmg,
            combo: 1,
            playerHp,
            enemyHp: nextEnemyHp,
          });
          telemetryCollectorRef.current.recordDamageDealt({
            damage: dmg,
            playerHp,
            enemyHp: nextEnemyHp,
          });
        } else {
          const newCombo = comboCount + 1;
          setComboCount(newCombo);

          const isCrit = newCombo >= 3;
          const baseDmg = isCrit ? 26 : 16;
          const weaponMultiplier = equippedWeapon?.powerBonusPercent
            ? 1 + equippedWeapon.powerBonusPercent / 100
            : 1.0;
          const dmg = Math.round(baseDmg * weaponMultiplier);
          const nextEnemyHp = Math.max(0, enemyHp - dmg);

          setEnemyHp(nextEnemyHp);
          setIsEnemyHit(true);
          if (isCrit) {
            playSound('combo_burst');
          } else {
            playSound('granted');
          }

          const weaponTag = equippedWeapon ? ` [${equippedWeapon.weapon.toUpperCase()}]` : '';
          setLastDamageEvent({
            text: isCrit ? `CRITICAL COMBO!${weaponTag} -${dmg} HP` : `HIT!${weaponTag} -${dmg} HP`,
            isCrit,
            id: Date.now(),
          });

          telemetryCollectorRef.current.recordHit({
            damage: dmg,
            combo: newCombo,
            playerHp,
            enemyHp: nextEnemyHp,
          });
          telemetryCollectorRef.current.recordDamageDealt({
            damage: dmg,
            playerHp,
            enemyHp: nextEnemyHp,
          });

          setTimeout(() => setIsEnemyHit(false), 200);

          if (comboResetTimer.current) clearTimeout(comboResetTimer.current);
          comboResetTimer.current = setTimeout(() => {
            setComboCount(0);
          }, 2000);
        }
      } else {
        // Record missed swing
        telemetryCollectorRef.current.recordMiss({
          distanceToEnemy: dist,
          playerHp,
          enemyHp,
        });
        setComboCount(0);
      }
      setIsPlayerAttacking(false);
    }, 220);
  };

  // Trigger Player Block
  const triggerPlayerBlockStart = () => {
    if (isVictory || isDefeat) return;
    setIsPlayerBlocking(true);
    playSound(isArchery ? 'scan' : 'shine'); // Archery Energy Buckler or Fox Melee Reflector Shine chime
    telemetryCollectorRef.current.recordBlock({
      playerHp,
      enemyHp,
    });
  };

  // Trigger Player Dodge with Directional Recognition
  const triggerPlayerDodge = () => {
    if (isPlayerDodging || isPlayerAttacking || isVictory || isDefeat) return;

    setIsPlayerDodging(true);
    playSound('dodge');

    // Directional recognition based on active keys & relative position
    let direction: DodgeDirection = 'neutral';
    if (keys.current.left) {
      direction = 'left';
    } else if (keys.current.right) {
      direction = 'right';
    } else if (keys.current.backward) {
      direction = 'backward';
    } else if (keys.current.forward) {
      direction = 'forward';
    } else {
      // Default lateral escape if neutral
      direction = Math.random() > 0.5 ? 'left' : 'right';
    }

    // In Demo Mode Match 1, force direction to left to guarantee 83%+ left-dodge pattern
    if (isDemoMode && demoStage === 'MATCH_1') {
      direction = 'left';
    } else if (isDemoMode && (demoStage === 'MATCH_2' || demoStage === 'LOCK_IN_CHALLENGE')) {
      // In Match 2, auto-trigger challenge on left dodges if still idle
      if (dodgeLockManagerRef.current.getState() === 'IDLE') {
        dodgeLockManagerRef.current.triggerPattern('left', 'right', 83);
      }
    }

    // Record dodge telemetry
    telemetryCollectorRef.current.recordDodge({
      direction,
      playerHp,
      enemyHp,
    });

    // Record into Dodge Direction Lock detector
    dodgeLockManagerRef.current.recordDodge(direction);

    // Apply +20% Dodge Speed & Drift buff if reward unlocked
    const hasReward = dodgeLockManagerRef.current.hasReward();
    const speedMultiplier = hasReward ? 1.2 : 1.0;
    const dodgeRecoveryMs = hasReward ? 250 : 320;

    const awayDir = new THREE.Vector3()
      .subVectors(playerPosRef.current, enemyPosRef.current)
      .normalize();

    if (direction === 'left') {
      playerPosRef.current.x -= 1.4 * speedMultiplier;
    } else if (direction === 'right') {
      playerPosRef.current.x += 1.4 * speedMultiplier;
    } else {
      playerPosRef.current.x += awayDir.x * 1.6 * speedMultiplier;
      playerPosRef.current.z += awayDir.z * 1.6 * speedMultiplier;
    }

    setTimeout(() => {
      setIsPlayerDodging(false);
    }, dodgeRecoveryMs);
  };

  // Trigger Player Special Ability (Voice Command "Special" or Key U/L)
  const triggerPlayerSpecial = () => {
    if (isPlayerAttacking || isPlayerDodging || isVictory || isDefeat) return;

    const dist = playerPosRef.current.distanceTo(enemyPosRef.current);

    // Archery Special: Triple Spread Plasma Volley
    if (isArchery) {
      setIsPlayerAttacking(true);
      playSound('bow_charge');
      setTimeout(() => {
        playSound('arrow_shot');
      }, 90);

      const startPos: [number, number, number] = [
        playerPosRef.current.x,
        playerPosRef.current.y + 1.1,
        playerPosRef.current.z,
      ];
      const targetVec = new THREE.Vector3(
        enemyPosRef.current.x,
        enemyPosRef.current.y + 1.0,
        enemyPosRef.current.z
      );
      const baseDir = new THREE.Vector3()
        .subVectors(targetVec, new THREE.Vector3(...startPos))
        .normalize();

      // Triple spread arrows (center, -14 deg, +14 deg)
      const angles = [0, -0.22, 0.22];
      const volleyArrows: PlasmaArrowData[] = angles.map((ang, i) => {
        const dir = baseDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
        return {
          id: Date.now() + i,
          start: startPos,
          dir: [dir.x, dir.y, dir.z],
          speed: 30,
          color: i === 0 ? '#38bdf8' : '#c084fc',
          damage: 26,
          isSpecial: true,
        };
      });

      setArrows((prev) => [...prev.slice(-8), ...volleyArrows]);

      telemetryCollectorRef.current.recordAttack({
        combo: comboCount + 1,
        distanceToEnemy: dist,
        playerHp,
        enemyHp,
      });

      setTimeout(() => {
        setIsPlayerAttacking(false);
      }, 380);
      return;
    }

    // Fox McCloud Melee: Arwing Blaster Laser
    setIsPlayerAttacking(true);
    playSound('laser'); // Arwing Blaster chirp
    playSound('granted');

    const from: [number, number, number] = [
      playerPosRef.current.x,
      playerPosRef.current.y + 1.0,
      playerPosRef.current.z,
    ];
    const to: [number, number, number] = [
      enemyPosRef.current.x,
      enemyPosRef.current.y + 1.0,
      enemyPosRef.current.z,
    ];
    const boltId = Date.now();
    setLaserBolts((prev) => [...prev.slice(-5), { id: boltId, from, to, color: '#ff3333' }]);
    setTimeout(() => setLaserBolts((prev) => prev.filter((b) => b.id !== boltId)), 600);

    // Multi-color elemental explosion sparks
    const hitX = (playerPosRef.current.x + enemyPosRef.current.x) / 2;
    const hitZ = (playerPosRef.current.z + enemyPosRef.current.z) / 2;
    setHitSparks((prev) => [
      ...prev.slice(-4),
      { id: Date.now(), pos: [hitX, 1.3, hitZ], color: '#ffaa00' },
      { id: Date.now() + 1, pos: [hitX - 0.2, 1.1, hitZ + 0.2], color: '#9d4edd' },
      { id: Date.now() + 2, pos: [hitX + 0.2, 1.4, hitZ - 0.2], color: '#00ff9d' },
    ]);

    const baseDmg = 32;
    const weaponMultiplier = equippedWeapon?.powerBonusPercent
      ? 1 + (equippedWeapon.powerBonusPercent / 100) * 1.5
      : 1.25;
    const dmg = Math.round(baseDmg * weaponMultiplier);
    const nextEnemyHp = Math.max(0, enemyHp - dmg);

    setEnemyHp(nextEnemyHp);
    setIsEnemyHit(true);

    const weaponName = equippedWeapon ? equippedWeapon.weapon.toUpperCase() : 'MYTHICAL SURGE';
    setLastDamageEvent({
      text: `✨ SPECIAL ABILITY! [${weaponName}] -${dmg} HP`,
      isCrit: true,
      id: Date.now(),
    });

    telemetryCollectorRef.current.recordAttack({
      combo: comboCount + 1,
      distanceToEnemy: dist,
      playerHp,
      enemyHp: nextEnemyHp,
    });
    telemetryCollectorRef.current.recordHit({
      damage: dmg,
      combo: comboCount + 1,
      playerHp,
      enemyHp: nextEnemyHp,
    });
    telemetryCollectorRef.current.recordDamageDealt({
      damage: dmg,
      playerHp,
      enemyHp: nextEnemyHp,
    });

    setTimeout(() => {
      setIsEnemyHit(false);
      setIsPlayerAttacking(false);
    }, 450);
  };

  // Groq Whisper & Web Speech API Voice Commands Integration (Attack, Block, Dodge, Special, Rematch)
  const voiceCommands = useVoiceCommands({
    onAttack: triggerPlayerAttack,
    onBlock: () => {
      triggerPlayerBlockStart();
      setTimeout(() => setIsPlayerBlocking(false), 900);
    },
    onDodge: triggerPlayerDodge,
    onSpecial: triggerPlayerSpecial,
    onRestart: () => handleRestartMatch(),
  });

  // Listen to Global Voice Commands dispatched from Floating Mic
  useEffect(() => {
    const handleGlobalVoiceCommand = (e: Event) => {
      const customEvent = e as CustomEvent<{ command: string }>;
      const cmd = customEvent.detail?.command;
      if (!cmd || isVictory || isDefeat) return;

      if (cmd === 'ATTACK') {
        triggerPlayerAttack();
      } else if (cmd === 'BLOCK') {
        triggerPlayerBlockStart();
        setTimeout(() => setIsPlayerBlocking(false), 900);
      } else if (cmd === 'DODGE') {
        triggerPlayerDodge();
      } else if (cmd === 'SPECIAL') {
        triggerPlayerSpecial();
      } else if (cmd === 'RESTART_MATCH') {
        handleRestartMatch();
      }
    };

    window.addEventListener('playnexus_voice_command', handleGlobalVoiceCommand);
    return () => window.removeEventListener('playnexus_voice_command', handleGlobalVoiceCommand);
  }, [isVictory, isDefeat]);

  // Keyboard action event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVictory || isDefeat) return;

      if (e.code === 'KeyJ') {
        triggerPlayerAttack();
      } else if (e.code === 'KeyK') {
        triggerPlayerBlockStart();
      } else if (e.code === 'KeyU' || e.code === 'KeyL') {
        triggerPlayerSpecial();
      } else if (e.code === 'Space') {
        triggerPlayerDodge();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyK') {
        setIsPlayerBlocking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isVictory, isDefeat, isPlayerAttacking, isPlayerDodging, comboCount]);

  // Victory Confetti & Defeat Audio
  useEffect(() => {
    if (isVictory) {
      playSound('victory');
      playSound('granted');
      try {
        confetti({
          particleCount: 100,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#00f0ff', '#00ff9d', '#9d4edd', '#ffffff'],
        });
      } catch {}
    } else if (isDefeat) {
      playSound('defeat');
      playSound('denied');
    }
  }, [isVictory, isDefeat, playSound]);

  // Restart Match Handler
  const handleRestartMatch = () => {
    playSound('transition');
    playSound('granted');
    setPlayerHp(PLAYER_MAX_HP);
    setEnemyHp(ENEMY_MAX_HP);
    setComboCount(0);
    setLastDamageEvent(null);
    playerPosRef.current.set(-2.2, 0.22, 0);
    enemyPosRef.current.set(2.5, 0.22, 0);
    setPlayerCoordinates([-2.2, 0.22, 0]);
    setIsPlayerHit(false);
    setIsEnemyHit(false);
    aiControllerRef.current.reset();
    dodgeLockManagerRef.current.reset();
    setIsPlayerAttacking(false);
    setIsPlayerBlocking(false);
    setIsPlayerDodging(false);

    // Reset telemetry
    telemetryCollectorRef.current.startMatch();
    clearTelemetry();
  };

  const playerStateBadge = isPlayerDodging
    ? 'DODGING'
    : isPlayerBlocking
    ? 'BLOCKING'
    : isPlayerAttacking
    ? 'ATTACKING'
    : isPlayerHit
    ? 'HIT'
    : 'NORMAL';

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: isArchery
          ? 'linear-gradient(180deg, #021a11 0%, #062c1d 60%, #02140d 100%)'
          : 'linear-gradient(180deg, #60a5fa 0%, #bfdbfe 100%)',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* 2D Combat HUD */}
      <CombatHUD
        playerHp={playerHp}
        playerMaxHp={PLAYER_MAX_HP}
        playerCodename={playerCodename}
        playerState={playerStateBadge}
        equippedWeapon={equippedWeapon}
        isVoiceListening={voiceCommands.isListening}
        lastVoiceCommand={voiceCommands.lastCommand}
        isVoiceSupported={voiceCommands.isSupported}
        voiceError={voiceCommands.error}
        onToggleVoice={voiceCommands.toggleListening}
        onSpecialPress={triggerPlayerSpecial}
        selectedStyle={selectedStyle}
        enemyHp={enemyHp}
        enemyMaxHp={ENEMY_MAX_HP}
        enemyState={isVictory ? 'DEFEATED' : aiCurrentState}
        comboCount={comboCount}
        lastDamageEvent={lastDamageEvent}
        isVictory={isVictory}
        isDefeat={isDefeat}
        onExit={onExit}
        onRestartMatch={handleRestartMatch}
        onNavigateAnalysis={() => navigate('/analysis')}
        onAttackPress={triggerPlayerAttack}
        onBlockPress={() => {
          triggerPlayerBlockStart();
          setTimeout(() => setIsPlayerBlocking(false), 600);
        }}
        onDodgePress={triggerPlayerDodge}
      />

      {/* Telemetry Real-time Debug HUD */}
      {isDebugPanelVisible && (
        <TelemetryDebugPanel
          events={liveEvents}
          metrics={liveMetrics}
          onClear={() => {
            telemetryCollectorRef.current.startMatch();
            clearTelemetry();
          }}
        />
      )}

      {/* Adaptive AI Learning & Counter-Strategy HUD */}
      <AdaptiveAIHUD
        strategy={adaptiveStrategy}
        tacticalEvent={adaptiveTacticalEvent}
      />

      {/* Dodge Direction Lock Cinematic Challenge Overlay */}
      <DodgeLockOverlay event={dodgeLockEvent} />

      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'high-performance', antialias: true, stencil: false }}
        camera={{ position: [0, 3.8, 7.2], fov: 45 }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        {/* Sky & Atmosphere — switches by stage theme */}
        {effectiveStageTheme === 'jungle' ? (
          <>
            <color attach="background" args={['#031d13']} />
            <fog attach="fog" args={['#062319', 25, 110]} />
            <ambientLight intensity={0.75} color="#10b981" />
            <hemisphereLight groundColor="#064e3b" color="#6ee7b7" intensity={0.6} />
            {/* Canopy filtered sunbeam */}
            <directionalLight
              position={[25, 45, 20]}
              intensity={2.4}
              color="#fef08a"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <directionalLight position={[-20, 30, -15]} intensity={0.7} color="#34d399" />
            {/* Ancient emerald shrine glow */}
            <pointLight position={[0, 4, 0]} intensity={2.2} color="#10b981" distance={24} />
          </>
        ) : effectiveStageTheme === 'space' ? (
          <>
            <color attach="background" args={['#020408']} />
            <fog attach="fog" args={['#020408', 60, 220]} />
            <ambientLight intensity={0.2} color="#3b5bdb" />
            <hemisphereLight groundColor="#0f172a" color="#7c3aed" intensity={0.5} />
            <directionalLight position={[40, 60, 40]} intensity={1.8} color="#a5f3fc" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <directionalLight position={[-20, 25, -20]} intensity={0.8} color="#818cf8" />
            <pointLight position={[0, 8, 0]} intensity={3} color="#7c3aed" distance={20} />
          </>
        ) : (
          <>
            <color attach="background" args={['#9fc5ec']} />
            <Sky sunPosition={[100, 45, 100]} inclination={0.6} azimuth={0.25} turbidity={8} rayleigh={1.2} />
            <fog attach="fog" args={['#c8d6e5', 45, 160]} />
            <ambientLight intensity={0.9} color="#ffffff" />
            <hemisphereLight groundColor="#d4b28c" color="#dbeafe" intensity={0.7} />
            <directionalLight position={[40, 60, 40]} intensity={2.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <directionalLight position={[-20, 25, -20]} intensity={0.6} color="#fef3c7" />
          </>
        )}

        {/* Dodge Lock Manager Game Loop Tick */}
        <ArenaGameLoop onUpdate={(delta) => dodgeLockManagerRef.current.update(delta)} />

        {/* Floating Atmospheric Particles */}
        {effectiveStageTheme === 'jungle' ? <JungleSporeParticles3D /> : <SunParticles3D />}

        {/* Arena Stage */}
        <PlayableArenaStage theme={effectiveStageTheme} />

        {/* Dynamic Hit Sparks */}
        {hitSparks.map((spark) => (
          <HitSpark key={spark.id} position={spark.pos} color={spark.color} />
        ))}

        {/* Arwing Laser Bolts */}
        {laserBolts.map((bolt) => (
          <LaserBolt key={bolt.id} from={bolt.from} to={bolt.to} color={bolt.color} />
        ))}

        {/* Cyber Plasma Arrows */}
        {arrows.map((arrow) => (
          <PlasmaArrowMesh
            key={arrow.id}
            arrow={arrow}
            onImpact={handleArrowImpact}
            enemyPosRef={enemyPosRef}
            playerPosRef={playerPosRef}
          />
        ))}

        {/* Archery Holographic Sniper Crosshair */}
        {isArchery && !isVictory && !isDefeat && (
          <SniperCrosshair targetPos={enemyPosRef} />
        )}

        {/* Camera Follow — frames both fighters dynamically */}
        <FollowCamera
          playerPosition={playerCoordinates}
          enemyPosition={[enemyPosRef.current.x, enemyPosRef.current.y, enemyPosRef.current.z]}
        />

        {/* Player Fighter */}
        <PlayerFighter
          position={playerPosRef}
          enemyPosition={enemyPosRef}
          isDead={isDefeat}
          isAttacking={isPlayerAttacking}
          isBlocking={isPlayerBlocking}
          isDodging={isPlayerDodging}
          isHit={isPlayerHit}
          costume={selectedCostume}
          selectedStyle={selectedStyle}
          onPositionUpdate={(pos, isMoving) => handlePlayerPositionUpdate(pos, isMoving)}
        />

        {/* Enemy Fighter (AI Opponent using Adaptive FSM) */}
        <EnemyFighter
          position={enemyPosRef}
          playerPosition={playerCoordinates}
          isDead={isVictory}
          isHit={isEnemyHit}
          aiControllerRef={aiControllerRef}
          enemyHp={enemyHp}
          playerHp={playerHp}
          isPlayerAttacking={isPlayerAttacking}
          isPlayerBlocking={isPlayerBlocking}
          isPlayerDodging={isPlayerDodging}
          playerComboCount={comboCount}
          isChallengeActive={dodgeLockEvent.state === 'CHALLENGE_ACTIVE'}
          selectedStyle={selectedStyle}
        />
      </Canvas>
    </div>
  );
};
