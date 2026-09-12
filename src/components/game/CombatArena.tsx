import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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
 * 3D Player Fighter Component
 */
interface PlayerFighterProps {
  position: React.MutableRefObject<THREE.Vector3>;
  isDead: boolean;
  isAttacking: boolean;
  isBlocking: boolean;
  isDodging: boolean;
  isHit: boolean;
  onPositionUpdate: (pos: [number, number, number], isMoving: boolean) => void;
}

const PlayerFighter: React.FC<PlayerFighterProps> = ({
  position,
  isDead,
  isAttacking,
  isBlocking,
  isDodging,
  isHit,
  onPositionUpdate,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const keys = useKeyboardControls();
  const targetRotation = useRef(Math.PI / 2);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isDead) {
      // Death collapse
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -Math.PI / 2, delta * 6);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.25, delta * 6);
      return;
    }

    // 1. Movement Input
    const moveX = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
    const moveZ = (keys.current.backward ? 1 : 0) - (keys.current.forward ? 1 : 0);
    const isMoving = (moveX !== 0 || moveZ !== 0) && !isBlocking;

    if (isMoving && !isDodging) {
      const moveDir = new THREE.Vector2(moveX, moveZ).normalize();
      const speedMultiplier = isBlocking ? 0.3 : 1.0;
      const moveStep = MOVEMENT_SPEED * speedMultiplier * delta;

      position.current.x += moveDir.x * moveStep;
      position.current.z += moveDir.y * moveStep;

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

    // 4. Combat Animations & Poses
    const t = state.clock.getElapsedTime();
    if (isAttacking) {
      groupRef.current.rotation.x = 0.35;
      groupRef.current.scale.set(1.15, 0.95, 1.25);
    } else if (isDodging) {
      groupRef.current.rotation.x = 0.5;
      groupRef.current.scale.set(0.9, 0.7, 0.9);
      position.current.y = 0.05;
    } else if (isBlocking) {
      groupRef.current.rotation.x = -0.15;
      groupRef.current.scale.set(1, 0.9, 1);
      position.current.y = 0.15;
    } else if (isMoving) {
      position.current.y = 0.2 + Math.abs(Math.sin(t * 12)) * 0.08;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.15, delta * 10);
      groupRef.current.scale.set(1, 1, 1);
    } else {
      position.current.y = 0.2 + Math.sin(t * 3) * 0.05;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 10);
      groupRef.current.scale.set(1, 1, 1);
    }

    groupRef.current.position.copy(position.current);
    onPositionUpdate([position.current.x, position.current.y, position.current.z], isMoving);
  });

  return (
    <group ref={groupRef} position={[-2.2, 0.2, 0]}>
      {/* Defensive Energy Shield when Blocking */}
      {isBlocking && (
        <mesh position={[0, 0.9, 0.2]}>
          <sphereGeometry args={[0.95, 24, 24]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} wireframe />
        </mesh>
      )}

      {/* Torso Capsule / Armor */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial
          color={isHit ? '#ffffff' : '#e2e8f0'}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Cyan Chest Plate */}
      <mesh position={[0, 0.95, 0.2]}>
        <boxGeometry args={[0.48, 0.45, 0.1]} />
        <meshStandardMaterial color="#0284c7" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Core Reactor Glow */}
      <mesh position={[0, 0.95, 0.26]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={isHit ? '#ff3366' : '#00f0ff'} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* Cyan Visor */}
      <mesh position={[0, 1.62, 0.18]}>
        <boxGeometry args={[0.26, 0.08, 0.1]} />
        <meshBasicMaterial color={isHit ? '#ffffff' : '#00f0ff'} />
      </mesh>

      {/* Left Fist / Attack Gauntlet */}
      <mesh
        position={[-0.38, isAttacking ? 1.15 : 0.9, isAttacking ? 0.65 : 0.2]}
        scale={isAttacking ? [1.3, 1.3, 1.8] : [1, 1, 1]}
      >
        <boxGeometry args={[0.18, 0.35, 0.18]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.3} metalness={0.85} />
      </mesh>
      <mesh position={[-0.38, isAttacking ? 1.15 : 0.72, isAttacking ? 0.8 : 0.24]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>

      {/* Right Fist / Guard Gauntlet */}
      <mesh position={[0.38, isBlocking ? 1.15 : 0.9, isBlocking ? 0.45 : 0.2]}>
        <boxGeometry args={[0.18, 0.35, 0.18]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.3} metalness={0.85} />
      </mesh>
      <mesh position={[0.38, isBlocking ? 1.15 : 0.72, isBlocking ? 0.55 : 0.24]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>

      {/* Shadow */}
      <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

/**
 * 3D Enemy AI Fighter Component with Finite State Machine Updates
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
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isDead) {
      // Enemy death fall
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.PI / 2, delta * 6);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.25, delta * 6);
      return;
    }

    // 1. Update AI Controller (Finite State Machine Decision & Movement Tick)
    // When challenge is active, AI flanks left to box in the player's left side
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
      },
      {
        isPlayerDodging,
        playerComboCount,
      }
    );

    const aiState = aiControllerRef.current.getState();

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

    // 3. Pose & Animation based on AI FSM State
    const t = state.clock.getElapsedTime();
    if (aiState === 'ATTACK') {
      groupRef.current.rotation.x = 0.35;
      groupRef.current.scale.set(1.2, 1, 1.25);
    } else if (aiState === 'BLOCK') {
      groupRef.current.rotation.x = -0.15;
      groupRef.current.scale.set(1, 0.9, 1);
    } else if (aiState === 'DODGE' || aiState === 'RETREAT') {
      groupRef.current.rotation.x = -0.2;
      groupRef.current.scale.set(0.95, 0.9, 0.95);
    } else {
      // Idle / Approach breathing
      position.current.y = 0.2 + Math.sin(t * 2.8 + 1.2) * 0.05;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 8);
      groupRef.current.scale.set(1, 1, 1);
    }

    groupRef.current.position.copy(position.current);
  });

  const isBlocking = aiControllerRef.current.isBlocking();
  const isAttacking = aiControllerRef.current.isAttacking();

  return (
    <group ref={groupRef} position={[2.5, 0.2, 0]}>
      {/* Enemy Defensive Shield when Blocking */}
      {isBlocking && (
        <mesh position={[0, 0.95, 0.2]}>
          <sphereGeometry args={[0.95, 24, 24]} />
          <meshBasicMaterial color="#ff0055" transparent opacity={0.3} wireframe />
        </mesh>
      )}

      {/* Heavy Armor Torso */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.75, 0.8, 0.45]} />
        <meshStandardMaterial
          color={isHit ? '#ffffff' : '#dc2626'}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Crimson Chest Reactor */}
      <mesh position={[0, 1.0, 0.24]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshBasicMaterial color={isHit ? '#ffffff' : '#ff0055'} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color="#991b1b" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* Intimidating Crest / Horns */}
      <mesh position={[-0.14, 1.84, 0]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.06, 0.26, 8]} />
        <meshStandardMaterial color="#ff0055" roughness={0.1} metalness={0.9} emissive="#ff0055" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.14, 1.84, 0]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.06, 0.26, 8]} />
        <meshStandardMaterial color="#ff0055" roughness={0.1} metalness={0.9} emissive="#ff0055" emissiveIntensity={0.5} />
      </mesh>

      {/* Crimson Visor Slit */}
      <mesh position={[0, 1.64, 0.2]}>
        <boxGeometry args={[0.28, 0.06, 0.1]} />
        <meshBasicMaterial color="#ff0055" />
      </mesh>

      {/* Left Heavy Attack Fist */}
      <mesh
        position={[-0.42, isAttacking ? 1.15 : 0.9, isAttacking ? 0.65 : 0.22]}
        scale={isAttacking ? [1.3, 1.3, 1.8] : [1, 1, 1]}
      >
        <boxGeometry args={[0.22, 0.42, 0.22]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Right Guard Fist */}
      <mesh position={[0.42, isBlocking ? 1.15 : 0.9, isBlocking ? 0.45 : 0.22]}>
        <boxGeometry args={[0.22, 0.42, 0.22]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Shadow */}
      <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

/**
 * Third-Person Following Camera
 */
interface FollowCameraProps {
  playerPosition: [number, number, number];
}

const FollowCamera: React.FC<FollowCameraProps> = ({ playerPosition }) => {
  useFrame((state, delta) => {
    const desiredPos = new THREE.Vector3(
      playerPosition[0] * 0.65,
      3.8,
      playerPosition[2] * 0.65 + 7.2
    );

    state.camera.position.lerp(desiredPos, delta * 5);

    const lookTarget = new THREE.Vector3(
      playerPosition[0] * 0.4,
      1.1,
      playerPosition[2] * 0.4
    );

    state.camera.lookAt(lookTarget);
  });

  return null;
};

/**
 * Arena Stage with boundary pylons
 */
const PlayableArenaStage: React.FC = () => {
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

  return (
    <group position={[0, 0, 0]}>
      {/* Base Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[ARENA_RADIUS + 0.5, ARENA_RADIUS + 1.2, 0.4, 48]} />
        <meshStandardMaterial color="#060911" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Glowing Outer Boundary Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[ARENA_RADIUS - 0.08, ARENA_RADIUS + 0.08, 64]} />
        <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} />
      </mesh>

      {/* Inner Hazard Warning Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[3.4, 3.55, 48]} />
        <meshBasicMaterial color="#ff0055" side={THREE.DoubleSide} transparent opacity={0.65} />
      </mesh>

      {/* Center Combat Glyph */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[1.1, 1.22, 32]} />
        <meshBasicMaterial color="#9d4edd" side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>

      {/* Depth Grid */}
      <gridHelper args={[14, 14, '#00f0ff', '#142033']} position={[0, 0.22, 0]} />

      {/* Energy Pylons */}
      {pylonPositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.9, 12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color="#00f0ff" />
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

  // Trigger Player Attack
  const triggerPlayerAttack = () => {
    if (isPlayerAttacking || isPlayerDodging || isVictory || isDefeat) return;

    setIsPlayerAttacking(true);
    playSound('pulse');

    const dist = playerPosRef.current.distanceTo(enemyPosRef.current);

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
          playSound('granted');

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
    if (isPlayerDodging || isVictory || isDefeat) return;
    setIsPlayerBlocking(true);
    telemetryCollectorRef.current.recordBlock({
      playerHp,
      enemyHp,
    });
  };

  // Trigger Player Dodge with Directional Recognition
  const triggerPlayerDodge = () => {
    if (isPlayerDodging || isPlayerAttacking || isVictory || isDefeat) return;

    setIsPlayerDodging(true);
    playSound('scan');

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

    setIsPlayerAttacking(true);
    playSound('granted');

    const dist = playerPosRef.current.distanceTo(enemyPosRef.current);
    const hitX = (playerPosRef.current.x + enemyPosRef.current.x) / 2;
    const hitZ = (playerPosRef.current.z + enemyPosRef.current.z) / 2;

    // Multi-color elemental explosion sparks
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

  // Web Speech API Voice Commands Integration (Attack, Block, Dodge, Special)
  const voiceCommands = useVoiceCommands({
    onAttack: triggerPlayerAttack,
    onBlock: () => {
      triggerPlayerBlockStart();
      setTimeout(() => setIsPlayerBlocking(false), 900);
    },
    onDodge: triggerPlayerDodge,
    onSpecial: triggerPlayerSpecial,
  });

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

  // Victory Confetti
  useEffect(() => {
    if (isVictory) {
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
      playSound('denied');
    }
  }, [isVictory, isDefeat, playSound]);

  // Restart Match Handler
  const handleRestartMatch = () => {
    playSound('granted');
    setPlayerHp(PLAYER_MAX_HP);
    setEnemyHp(ENEMY_MAX_HP);
    setComboCount(0);
    setLastDamageEvent(null);
    playerPosRef.current.set(-2.2, 0.2, 0);
    enemyPosRef.current.set(2.5, 0.2, 0);
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
        backgroundColor: '#05070c',
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
        <fog attach="fog" args={['#05070c', 5, 22]} />

        {/* Dodge Lock Manager Game Loop Tick */}
        <ArenaGameLoop onUpdate={(delta) => dodgeLockManagerRef.current.update(delta)} />

        {/* Lights */}
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <pointLight position={[-4, 3, 2]} intensity={2.5} color="#00f0ff" distance={9} />
        <pointLight position={[4, 3, 2]} intensity={2.5} color="#ff0055" distance={9} />
        <pointLight position={[0, 4, 0]} intensity={1} color="#9d4edd" distance={8} />

        {/* Arena Stage */}
        <PlayableArenaStage />

        {/* Dynamic Hit Sparks */}
        {hitSparks.map((spark) => (
          <HitSpark key={spark.id} position={spark.pos} color={spark.color} />
        ))}

        {/* Camera Follow */}
        <FollowCamera playerPosition={playerCoordinates} />

        {/* Player Fighter */}
        <PlayerFighter
          position={playerPosRef}
          isDead={isDefeat}
          isAttacking={isPlayerAttacking}
          isBlocking={isPlayerBlocking}
          isDodging={isPlayerDodging}
          isHit={isPlayerHit}
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
        />
      </Canvas>
    </div>
  );
};
