import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Login } from '../pages/Login/Login';
import { Register } from '../pages/Register/Register';
import { Home } from '../pages/Home/Home';
import { CharacterSelect } from '../pages/CharacterSelect/CharacterSelect';
import { PreFight } from '../pages/PreFight/PreFight';
import { Arena } from '../pages/Arena/Arena';
import { Analysis } from '../pages/Analysis/Analysis';
import { Leaderboard } from '../pages/Leaderboard/Leaderboard';
import { Settings } from '../pages/Settings/Settings';
import { Profile } from '../pages/Profile/Profile';

export const AppRoutes: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Login
            onNavigateHome={() => navigate('/')}
            onNavigateRegister={() => navigate('/register')}
          />
        }
      />
      <Route
        path="/register"
        element={
          <Register
            onNavigateLogin={() => navigate('/login')}
            onNavigateHome={() => navigate('/')}
          />
        }
      />
      <Route
        path="/"
        element={
          <Home
            onNavigateLogin={() => navigate('/login')}
            onNavigateArena={() => navigate('/arena')}
          />
        }
      />
      <Route path="/character-select" element={<CharacterSelect />} />
      <Route path="/pre-fight" element={<PreFight />} />
      <Route path="/prefight" element={<PreFight />} />
      <Route path="/arena" element={<Arena />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      {/* Fallback route */}
      <Route
        path="*"
        element={
          <Home
            onNavigateLogin={() => navigate('/login')}
            onNavigateArena={() => navigate('/arena')}
          />
        }
      />
    </Routes>
  );
};
