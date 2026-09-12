import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CombatArena } from '../../components/game/CombatArena';
import { useAuth } from '../../hooks/useAuth';

export const Arena: React.FC = () => {
  const navigate = useNavigate();
  const { player } = useAuth();

  return (
    <CombatArena
      onExit={() => navigate('/')}
      playerCodename={player?.codename || 'OPERATIVE'}
    />
  );
};
