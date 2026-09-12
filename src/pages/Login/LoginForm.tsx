import React, { useState } from 'react';
import { AlertCircle, Zap, User, ArrowRight } from 'lucide-react';
import { InputField } from './InputField';
import { PasswordField } from './PasswordField';
import { RememberPlayer } from './RememberPlayer';
import { ForgotPassword } from './ForgotPassword';
import { RegisterLink } from './RegisterLink';
import { GlowButton } from '../../components/common/GlowButton';
import { useSound } from '../../hooks/useSound';

interface LoginFormProps {
  onLoginSuccess: (playerId: string) => void;
  onNavigateRegister: () => void;
  onStatusChange?: (status: 'STANDBY' | 'SCANNING' | 'AUTHENTICATING' | 'ACCESS_GRANTED' | 'ACCESS_DENIED') => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onNavigateRegister,
  onStatusChange,
}) => {
  const [username, setUsername] = useState('CYBER_STRIKER_01');
  const [password, setPassword] = useState('NEXUS-2099');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { playSound } = useSound();

  // 1-Click Instant Demo Login for Hackathon Judges and quick testing
  const handleInstantDemoLogin = (customUser?: string) => {
    playSound('granted');
    const selected = customUser || 'TITAN_WARRIOR';
    setUsername(selected);
    setPassword('NEXUS-MASTER-PASS');
    setErrorMessage(null);
    setIsLoading(true);
    onStatusChange?.('AUTHENTICATING');

    setTimeout(() => {
      setIsLoading(false);
      onStatusChange?.('ACCESS_GRANTED');
      onLoginSuccess(selected);
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side mock validation
    if (!username.trim() || !password.trim()) {
      setErrorMessage('PLEASE PROVIDE BOTH USERNAME/EMAIL AND PASSWORD.');
      playSound('denied');
      onStatusChange?.('ACCESS_DENIED');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('PASSWORD MUST CONTAIN AT LEAST 4 CHARACTERS.');
      playSound('denied');
      onStatusChange?.('ACCESS_DENIED');
      return;
    }

    setIsLoading(true);
    playSound('granted');
    onStatusChange?.('AUTHENTICATING');

    setTimeout(() => {
      setIsLoading(false);
      onStatusChange?.('ACCESS_GRANTED');
      onLoginSuccess(username.trim());
    }, 600);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="glass-login-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        width: '100%',
        padding: '32px',
        background: 'rgba(10, 15, 26, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 240, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top neon border accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent-cyan, #00f0ff), transparent)',
          boxShadow: '0 0 10px #00f0ff',
        }}
      />

      {/* Header section inside card */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.72rem',
              color: 'var(--accent-cyan, #00f0ff)',
              letterSpacing: '0.14em',
              fontWeight: 700,
            }}
          >
            ● NEURAL GATEWAY // ONLINE
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.68rem',
              color: 'var(--text-muted, #94a3b8)',
              letterSpacing: '0.08em',
            }}
          >
            V.2.4-HACKATHON
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: '1.75rem',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          OPERATOR ACCESS
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body, sans-serif)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary, #94a3b8)',
            margin: '4px 0 0',
          }}
        >
          Authenticate your credentials to link your Fighting DNA.
        </p>
      </div>

      {/* 1-Click Fast Judge Demo Access */}
      <button
        type="button"
        onClick={() => handleInstantDemoLogin()}
        onMouseEnter={() => playSound('hover')}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'rgba(0, 240, 255, 0.08)',
          border: '1.5px dashed rgba(0, 240, 255, 0.4)',
          borderRadius: '10px',
          color: 'var(--accent-cyan, #00f0ff)',
          fontFamily: 'var(--font-hud, monospace)',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <Zap size={14} />
        <span>⚡ 1-CLICK QUICK ACCESS (JUDGE DEMO)</span>
      </button>

      {/* Error Alert Display */}
      {errorMessage && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'rgba(255, 51, 102, 0.15)',
            border: '1px solid #ff3366',
            borderRadius: '8px',
            color: '#ff3366',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.78rem',
            animation: 'shakeAlert 0.4s ease-in-out',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Username / Email Input */}
      <InputField
        id="nexus-username"
        label="USERNAME / EMAIL"
        value={username}
        placeholder="ENTER USERNAME OR EMAIL"
        icon={<User size={18} />}
        onChange={e => {
          setUsername(e.target.value);
          if (errorMessage) setErrorMessage(null);
          onStatusChange?.('SCANNING');
        }}
        onFocus={() => onStatusChange?.('SCANNING')}
        onBlur={() => onStatusChange?.('STANDBY')}
        autoComplete="username"
      />

      {/* Password Input with Visibility Toggle */}
      <PasswordField
        id="nexus-password"
        value={password}
        onChange={e => {
          setPassword(e.target.value);
          if (errorMessage) setErrorMessage(null);
          onStatusChange?.('SCANNING');
        }}
        onFocus={() => onStatusChange?.('SCANNING')}
        onBlur={() => onStatusChange?.('STANDBY')}
      />

      {/* Remember Player & Forgot Password */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '2px',
        }}
      >
        <RememberPlayer checked={rememberMe} onChange={setRememberMe} />
        <ForgotPassword />
      </div>

      {/* Login Button */}
      <GlowButton
        type="submit"
        variant="primary"
        disabled={isLoading}
        style={{ width: '100%', marginTop: '6px' }}
      >
        <span>{isLoading ? 'ESTABLISHING LINK...' : 'ENTER THE NEXUS'}</span>
        <ArrowRight size={18} />
      </GlowButton>

      {/* Create Player Profile Link */}
      <RegisterLink onNavigateRegister={onNavigateRegister} />

      <style>{`
        @keyframes shakeAlert {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </form>
  );
};
