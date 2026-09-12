import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { CombatHUD } from './CombatHUD';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useSound } from '../../hooks/useSound';

const ARENA_RADIUS = 6.2;
const MOVEMENT_SPEED = 5.2;
const ATTACK_RANGE = 2.2;
const PLAYER_MAX_HP = 100;
const ENEMY_MAX_HP = 100;

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
 * 3D Player Fighter Component with WASD Movement, Attack, Block, Dodge, and Hit animations
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
      // Death collapse animation: fall backward to the ground
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

      // Rotate towards movement
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
      // Attack lunge: lean forward and lunge
      groupRef.current.rotation.x = 0.35;
      groupRef.current.scale.set(1.15, 0.95, 1.25);
    } else if (isDodging) {
      // Dodge roll/dash: low profile roll
      groupRef.current.rotation.x = 0.5;
      groupRef.current.scale.set(0.9, 0.7, 0.9);
      position.current.y = 0.05;
    } else if (isBlocking) {
      // Guard stance: defensive crouch
      groupRef.current.rotation.x = -0.15;
      groupRef.current.scale.set(1, 0.9, 1);
      position.current.y = 0.15;
    } else if (isMoving) {
      // Running stride
      position.current.y = 0.2 + Math.abs(Math.sin(t * 12)) * 0.08;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.15, delta * 10);
      groupRef.current.scale.set(1, 1, 1);
    } else {
      // Idle combat stance breathing
      position.current.y = 0.2 + Math.sin(t * 3) * 0.05;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 10);
      groupRef.current.scale.set(1, 1, 1);
    }

    // Apply translation
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
          color={isHit ? '#ffffff' : '#0f172a'}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Cyan Chest Plate */}
      <mesh position={[0, 0.95, 0.2]}>
        <boxGeometry args={[0.48, 0.45, 0.1]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Core Reactor Glow */}
      <mesh position={[0, 0.95, 0.26]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={isHit ? '#ff3366' : '#00f0ff'} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#0b0e14" roughness={0.4} metalness={0.7} />
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
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[-0.38, isAttacking ? 1.15 : 0.72, isAttacking ? 0.8 : 0.24]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>

      {/* Right Fist / Guard Gauntlet */}
      <mesh position={[0.38, isBlocking ? 1.15 : 0.9, isBlocking ? 0.45 : 0.2]}>
        <boxGeometry args={[0.18, 0.35, 0.18]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
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
 * 3D Enemy AI Fighter with Attack, Block, Dodge, and Death animations
 */
interface EnemyFighterProps {
  position: React.MutableRefObject<THREE.Vector3>;
  playerPosition: [number, number, number];
  isDead: boolean;
  isAttacking: boolean;
  isBlocking: boolean;
  isHit: boolean;
}

const EnemyFighter: React.FC<EnemyFighterProps> = ({
  position,
  playerPosition,
  isDead,
  isAttacking,
  isBlocking,
  isHit,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isDead) {
      // Enemy death fall: collapse backward onto the stage
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.PI / 2, delta * 6);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.25, delta * 6);
      return;
    }

    // Turn toward player
    const angleToPlayer = Math.atan2(
      playerPosition[0] - position.current.x,
      playerPosition[2] - position.current.z
    );

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      angleToPlayer,
      delta * 5
    );

    // Combat animations
    const t = state.clock.getElapsedTime();
    if (isAttacking) {
      // Attack strike lunge
      groupRef.current.rotation.x = 0.35;
      groupRef.current.scale.set(1.2, 1, 1.25);
    } else if (isBlocking) {
      // Defensive guard
      groupRef.current.rotation.x = -0.15;
      groupRef.current.scale.set(1, 0.9, 1);
    } else {
      // Idle breathing
      position.current.y = 0.2 + Math.sin(t * 2.8 + 1.2) * 0.05;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 8);
      groupRef.current.scale.set(1, 1, 1);
    }

    groupRef.current.position.copy(position.current);
  });

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
          color={isHit ? '#ffffff' : '#180d1e'}
          roughness={0.3}
          metalness={0.85}
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
        <meshStandardMaterial color="#0d0812" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Intimidating Crest / Horns */}
      <mesh position={[-0.14, 1.84, 0]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.06, 0.26, 8]} />
        <meshStandardMaterial color="#ff0055" />
      </mesh>
      <mesh position={[0.14, 1.84, 0]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.06, 0.26, 8]} />
        <meshStandardMaterial color="#ff0055" />
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
        <meshStandardMaterial color="#2d132c" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Right Guard Fist */}
      <mesh position={[0.42, isBlocking ? 1.15 : 0.9, isBlocking ? 0.45 : 0.22]}>
        <boxGeometry args={[0.22, 0.42, 0.22]} />
        <meshStandardMaterial color="#2d132c" roughness={0.4} metalness={0.8} />
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

  // Positions (Refs for 60 FPS physics & game loop)
  const playerPosRef = useRef(new THREE.Vector3(-2.2, 0.2, 0));
  const enemyPosRef = useRef(new THREE.Vector3(2.5, 0.2, 0));
  const [playerCoordinates, setPlayerCoordinates] = useState<[number, number, number]>([-2.2, 0.2, 0]);

  // Health
  const [playerHp, setPlayerHp] = useState<number>(PLAYER_MAX_HP);
  const [enemyHp, setEnemyHp] = useState<number>(ENEMY_MAX_HP);

  // States
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isPlayerBlocking, setIsPlayerBlocking] = useState(false);
  const [isPlayerDodging, setIsPlayerDodging] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);

  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false);
  const [isEnemyBlocking, setIsEnemyBlocking] = useState(false);
  const [isEnemyHit, setIsEnemyHit] = useState(false);

  // Combo & Damage feedback
  const [comboCount, setComboCount] = useState(0);
  const comboResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastDamageEvent, setLastDamageEvent] = useState<{ text: string; isCrit?: boolean; id: number } | null>(null);
  const [hitSparks, setHitSparks] = useState<{ id: number; pos: [number, number, number]; color: string }[]>([]);

  // End of match
  const isVictory = enemyHp <= 0;
  const isDefeat = playerHp <= 0;

  // Trigger attack
  const triggerPlayerAttack = () => {
    if (isPlayerAttacking || isPlayerDodging || isVictory || isDefeat) return;

    setIsPlayerAttacking(true);
    playSound('pulse');

    // Check distance between player and enemy
    const dist = playerPosRef.current.distanceTo(enemyPosRef.current);

    setTimeout(() => {
      if (dist <= ATTACK_RANGE && !isVictory && !isDefeat) {
        // Attack hit!
        const hitX = (playerPosRef.current.x + enemyPosRef.current.x) / 2;
        const hitZ = (playerPosRef.current.z + enemyPosRef.current.z) / 2;

        // Spawn hit spark
        setHitSparks(prev => [...prev, { id: Date.now(), pos: [hitX, 1.1, hitZ], color: '#00f0ff' }]);

        if (isEnemyBlocking) {
          // Blocked damage
          const dmg = 5;
          setEnemyHp(hp => Math.max(0, hp - dmg));
          playSound('scan');
          setLastDamageEvent({ text: `BLOCKED! -${dmg} HP`, isCrit: false, id: Date.now() });
        } else {
          // Clean hit
          const newCombo = comboCount + 1;
          setComboCount(newCombo);

          // Crit on 3rd combo hit!
          const isCrit = newCombo >= 3;
          const dmg = isCrit ? 26 : 16;

          setEnemyHp(hp => Math.max(0, hp - dmg));
          setIsEnemyHit(true);
          playSound('granted');

          setLastDamageEvent({
            text: isCrit ? `CRITICAL COMBO! -${dmg} HP` : `HIT! -${dmg} HP`,
            isCrit,
            id: Date.now(),
          });

          setTimeout(() => setIsEnemyHit(false), 200);

          // Reset combo after 2 seconds of inactivity
          if (comboResetTimer.current) clearTimeout(comboResetTimer.current);
          comboResetTimer.current = setTimeout(() => {
            setComboCount(0);
          }, 2000);
        }
      } else {
        // Whiffed / Missed
        setComboCount(0);
      }
      setIsPlayerAttacking(false);
    }, 220);
  };

  // Trigger Dodge
  const triggerPlayerDodge = () => {
    if (isPlayerDodging || isPlayerAttacking || isVictory || isDefeat) return;

    setIsPlayerDodging(true);
    playSound('scan');

    // Quick evasive slip backward or away from enemy
    const awayDir = new THREE.Vector3()
      .subVectors(playerPosRef.current, enemyPosRef.current)
      .normalize();

    playerPosRef.current.x += awayDir.x * 1.6;
    playerPosRef.current.z += awayDir.z * 1.6;

    setTimeout(() => {
      setIsPlayerDodging(false);
    }, 320);
  };

  // Keyboard action event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVictory || isDefeat) return;

      if (e.code === 'KeyJ') {
        triggerPlayerAttack();
      } else if (e.code === 'KeyK') {
        setIsPlayerBlocking(true);
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

  // Enemy Combat Loop (Periodic attack/defense)
  useEffect(() => {
    if (isVictory || isDefeat) return;

    const aiInterval = setInterval(() => {
      if (isVictory || isDefeat) return;

      const dist = playerPosRef.current.distanceTo(enemyPosRef.current);

      if (dist <= ATTACK_RANGE) {
        // 70% chance to attack, 30% chance to block
        const action = Math.random() > 0.3 ? 'ATTACK' : 'BLOCK';

        if (action === 'ATTACK') {
          setIsEnemyAttacking(true);
          playSound('pulse');

          setTimeout(() => {
            const currentDist = playerPosRef.current.distanceTo(enemyPosRef.current);
            if (currentDist <= ATTACK_RANGE && !isVictory && !isDefeat) {
              if (isPlayerDodging) {
                setLastDamageEvent({ text: 'AI ATTACK DODGED!', isCrit: false, id: Date.now() });
              } else if (isPlayerBlocking) {
                const dmg = 4;
                setPlayerHp(hp => Math.max(0, hp - dmg));
                playSound('scan');
                setLastDamageEvent({ text: `BLOCKED ENEMY! -${dmg} HP`, isCrit: false, id: Date.now() });
              } else {
                const dmg = 14;
                setPlayerHp(hp => Math.max(0, hp - dmg));
                setIsPlayerHit(true);
                playSound('denied');
                setLastDamageEvent({ text: `ENEMY STRIKE! -${dmg} HP`, isCrit: true, id: Date.now() });
                setTimeout(() => setIsPlayerHit(false), 200);
              }
            }
            setIsEnemyAttacking(false);
          }, 240);
        } else {
          // AI raises block for 800ms
          setIsEnemyBlocking(true);
          setTimeout(() => setIsEnemyBlocking(false), 800);
        }
      } else {
        // If player is far away, enemy slowly stalks closer
        const towardPlayer = new THREE.Vector3()
          .subVectors(playerPosRef.current, enemyPosRef.current)
          .normalize();
        enemyPosRef.current.x += towardPlayer.x * 0.45;
        enemyPosRef.current.z += towardPlayer.z * 0.45;
      }
    }, 1600);

    return () => clearInterval(aiInterval);
  }, [isVictory, isDefeat, isPlayerDodging, isPlayerBlocking]);

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
    setIsPlayerAttacking(false);
    setIsPlayerBlocking(false);
    setIsPlayerDodging(false);
    setIsEnemyAttacking(false);
    setIsEnemyBlocking(false);
  };

  // Determine state labels for HUD badges
  const playerStateBadge = isPlayerDodging
    ? 'DODGING'
    : isPlayerBlocking
    ? 'BLOCKING'
    : isPlayerAttacking
    ? 'ATTACKING'
    : isPlayerHit
    ? 'HIT'
    : 'NORMAL';

  const enemyStateBadge = isEnemyBlocking
    ? 'BLOCKING'
    : isEnemyAttacking
    ? 'ATTACKING'
    : isEnemyHit
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
      {/* 2D Combat HUD with Health Bars, Combo Counter, and Overlays */}
      <CombatHUD
        playerHp={playerHp}
        playerMaxHp={PLAYER_MAX_HP}
        playerCodename={playerCodename}
        playerState={playerStateBadge}
        enemyHp={enemyHp}
        enemyMaxHp={ENEMY_MAX_HP}
        enemyState={enemyStateBadge}
        comboCount={comboCount}
        lastDamageEvent={lastDamageEvent}
        isVictory={isVictory}
        isDefeat={isDefeat}
        onExit={onExit}
        onRestartMatch={handleRestartMatch}
        onNavigateAnalysis={() => navigate('/analysis')}
        onAttackPress={triggerPlayerAttack}
        onBlockPress={() => {
          setIsPlayerBlocking(true);
          setTimeout(() => setIsPlayerBlocking(false), 600);
        }}
        onDodgePress={triggerPlayerDodge}
      />

      {/* 3D Canvas (React Three Fiber) */}
      <Canvas
        shadows
        camera={{ position: [0, 3.8, 7.2], fov: 45 }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <fog attach="fog" args={['#05070c', 5, 22]} />

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

        {/* Player Fighter (WASD + J, K, SPACE) */}
        <PlayerFighter
          position={playerPosRef}
          isDead={isDefeat}
          isAttacking={isPlayerAttacking}
          isBlocking={isPlayerBlocking}
          isDodging={isPlayerDodging}
          isHit={isPlayerHit}
          onPositionUpdate={(pos) => setPlayerCoordinates(pos)}
        />

        {/* Enemy Fighter (AI Opponent) */}
        <EnemyFighter
          position={enemyPosRef}
          playerPosition={playerCoordinates}
          isDead={isVictory}
          isAttacking={isEnemyAttacking}
          isBlocking={isEnemyBlocking}
          isHit={isEnemyHit}
        />
      </Canvas>
    </div>
  );
};
