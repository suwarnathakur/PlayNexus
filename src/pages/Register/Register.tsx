import React, { useState } from 'react';
import { Logo } from '../../components/common/Logo';
import { GridBackground } from '../../components/effects/GridBackground';
import { ParticleField } from '../../components/effects/ParticleField';
import { Scanline } from '../../components/effects/Scanline';
import { NexusHUD } from '../../components/nexus/NexusHUD';
import { InputField } from '../Login/InputField';
import { PasswordField } from '../Login/PasswordField';
import { GlowButton } from '../../components/common/GlowButton';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import { useSound } from '../../hooks/useSound';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, User, Mail, Shield, Award } from 'lucide-react';
import '../Login/login.css';

interface RegisterProps {
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const Register: React.FC<RegisterProps> = ({
  onNavigateLogin,
  onNavigateHome,
}) => {
  const [codename, setCodename] = useState('');
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [archetype, setArchetype] = useState('HYBRID STRIKER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parallax = useMouseParallax();
  const { playSound } = useSound();
  const { login } = useAuth();

  const archetypes = [
    { name: 'HYBRID STRIKER', desc: 'Balanced offensive combinations & high counter speed' },
    { name: 'NEURAL ADAPTOR', desc: 'Predictive algorithm learns opponent patterns in real-time' },
    { name: 'IRON BULWARK', desc: 'High poise, counter damage & defensive parry frames' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codename || !email || !accessCode) {
      setError('ALL COMBAT PROFILE FIELDS ARE MANDATORY');
      playSound('denied');
      return;
    }

    setIsLoading(true);
    playSound('scan');

    setTimeout(() => {
      setIsLoading(false);
      playSound('granted');
      login(codename, true);
      onNavigateHome();
    }, 1200);
  };

  return (
    <main className="login-viewport">
      <GridBackground
        parallaxX={parallax.smoothX}
        parallaxY={parallax.smoothY}
      />
      <ParticleField
        parallaxX={parallax.smoothX}
        parallaxY={parallax.smoothY}
      />
      <Scanline />
      <NexusHUD
        parallaxX={parallax.smoothX}
        parallaxY={parallax.smoothY}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '680px',
          padding: '90px 24px 70px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        <div style={{ alignSelf: 'flex-start' }}>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onNavigateLogin();
            }}
            onMouseEnter={() => playSound('hover')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-hud)',
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)',
              letterSpacing: '0.14em',
              padding: '6px 12px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeft size={16} />
            <span>RETURN TO AUTHENTICATION</span>
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Logo size="md" />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#ffffff',
              marginTop: '10px',
            }}
          >
            INITIALIZE COMBAT IDENTITY
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-hud)',
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.1em',
            }}
          >
            Register your neural signature with the PLAYNEXUS combat ledger.
          </p>
        </div>

        {/* Registration Card */}
        <div
          className="cyber-panel"
          style={{
            width: '100%',
            padding: '36px',
            background: 'rgba(9, 14, 24, 0.85)',
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255, 51, 102, 0.15)',
                  border: '1px solid var(--status-warning)',
                  borderRadius: '6px',
                  color: 'var(--status-warning)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.76rem',
                }}
              >
                {error}
              </div>
            )}

            <InputField
              id="reg-codename"
              label="OPERATIVE CODENAME / FIGHTER ID"
              value={codename}
              placeholder="E.G. NEXUS_STRIKER"
              icon={<User size={18} />}
              onChange={e => setCodename(e.target.value)}
            />

            <InputField
              id="reg-email"
              label="NEURAL LINK FREQUENCY / EMAIL"
              type="email"
              value={email}
              placeholder="OPERATIVE@PLAYNEXUS.AI"
              icon={<Mail size={18} />}
              onChange={e => setEmail(e.target.value)}
            />

            <PasswordField
              id="reg-password"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
            />

            {/* Combat Archetype Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontFamily: 'var(--font-hud)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  color: 'var(--accent-cyan)',
                  textTransform: 'uppercase',
                }}
              >
                INITIAL FIGHTING DNA ARCHETYPE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {archetypes.map(item => {
                  const isSelected = archetype === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setArchetype(item.name);
                      }}
                      onMouseEnter={() => playSound('hover')}
                      style={{
                        padding: '12px',
                        background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(5, 8, 15, 0.6)',
                        border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isSelected ? 'var(--accent-cyan)' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isSelected && <Shield size={12} />}
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <GlowButton
                type="submit"
                variant="primary"
                isLoading={isLoading}
                loadingText="INITIALIZING NEURAL PROFILE..."
                style={{ width: '100%', padding: '16px' }}
              >
                <Award size={18} />
                <span>FORGE COMBAT IDENTITY →</span>
              </GlowButton>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
