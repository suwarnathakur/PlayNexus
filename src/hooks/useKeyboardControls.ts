import { useEffect, useRef } from 'react';

export interface CombatKeys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
  block: boolean;
  dodge: boolean;
}

export function useKeyboardControls() {
  const keys = useRef<CombatKeys>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    attack: false,
    block: false,
    dodge: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for game keys
      if ([
        'KeyW', 'KeyS', 'KeyA', 'KeyD',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'KeyJ', 'KeyK', 'Space'
      ].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'KeyJ':
          keys.current.attack = true;
          break;
        case 'KeyK':
          keys.current.block = true;
          break;
        case 'Space':
          keys.current.dodge = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'KeyJ':
          keys.current.attack = false;
          break;
        case 'KeyK':
          keys.current.block = false;
          break;
        case 'Space':
          keys.current.dodge = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}
