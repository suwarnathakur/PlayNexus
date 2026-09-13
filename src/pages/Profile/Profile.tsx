import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  ChevronRight,
  Flame,
  Gauge,
  Shield,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react';
import { GlowButton } from '../../components/common/GlowButton';
import { Logo } from '../../components/common/Logo';
import { Scanline } from '../../components/effects/Scanline';
import { useSound } from '../../hooks/useSound';
import {
  DEFAULT_PLAYER_PROFILE,
  awardXp,
  loadPlayerProfile,
  readLocalPlayerProfile,
  saveLocalPlayerProfile,
  syncPlayerProfileToBackend,
  type PlayerProfile,
} from '../../services/playerProfileService';

const dnaMetrics = [
  { label: 'AGGRESSION', key: 'aggression' },
  { label: 'DEFENSE', key: 'defense' },
  { label: 'MOBILITY', key: 'mobility' },
  { label: 'TIMING', key: 'reactionTime' },
  { label: 'RANGE', key: 'preferredRange' },
] as const;

const formatDNAValue = (key: string, value: any) => {
  if (key === 'reactionTime') return `${Number(value).toFixed(2)}s`;
  if (key === 'preferredRange') return String(value).toUpperCase();
  if (typeof value === 'number') return `${Math.round(value * 100)}%`;
  return String(value).toUpperCase();
};

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { playSound } = useSound();
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PLAYER_PROFILE);
  const [isLeveling, setIsLeveling] = useState(false);
  const [flashMessage, setFlashMessage] = useState('PROFILE SYNCHRONIZED');

  useEffect(() => {
    let mounted = true;

    const hydrateProfile = async () => {
      const localProfile = readLocalPlayerProfile();
      const remoteProfile = await loadPlayerProfile(localProfile.playerId);
      const nextProfile = remoteProfile ?? localProfile;
      if (mounted) {
        setProfile(nextProfile);
        saveLocalPlayerProfile(nextProfile);
      }
    };

    hydrateProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const progression = useMemo(() => { 
    const currentLevelXp = profile.xpToNextLevel || 5000;
    const percent = Math.min(100, (profile.xp / currentLevelXp) * 100);
    return {
      currentLevelXp,
      percent,
      nextThreshold: currentLevelXp,
    };
  }, [profile.xp, profile.xpToNextLevel]);

  const handleAwardReward = async (rewardType: 'victory' | 'adaptation' | 'lock-in') => {
    const result = awardXp(profile, rewardType);
    const nextProfile = result.profile;
    setProfile(nextProfile);
    setFlashMessage(
      result.leveledUp ? 'LEVEL UP // COGNITIVE CORE STABILIZED' : 'XP DISPENSED // PROFILE UPDATED'
    );
    setIsLeveling(result.leveledUp);
    if (result.leveledUp) {
      setTimeout(() => setIsLeveling(false), 1800);
    }
    playSound('granted');

    const persisted = await syncPlayerProfileToBackend(nextProfile);
    setProfile(persisted);
    saveLocalPlayerProfile(persisted);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', background: '#05070c', color: '#fff', overflowX: 'hidden', overflowY: 'auto', padding: '24px 32px 40px' }}>
      <Scanline />
      <header style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <Logo size="sm" />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <GlowButton variant="secondary" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            <span>BACK TO DASHBOARD</span>
          </GlowButton>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '24px auto 0', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.72rem', letterSpacing: '0.18em', color: '#00f0ff', textTransform: 'uppercase' }}>
              Operative dossier
            </div>
            <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(2.2rem, 4vw, 4rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Player Profile
            </h1>
          </div>

          <div
            style={{
              border: '1px solid rgba(0, 240, 255, 0.25)',
              background: 'rgba(11, 17, 28, 0.82)',
              borderRadius: '16px',
              padding: '10px 16px',
              color: '#9ae6ff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {flashMessage}
          </div>
        </div>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1.35fr 0.95fr',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          <div style={{ background: 'rgba(11, 17, 28, 0.82)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '26px', padding: '20px', boxShadow: '0 0 24px rgba(0,240,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(0,240,255,0.3), rgba(157,78,221,0.3))', border: '1px solid rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center' }}>
                  <Swords size={30} color="#00f0ff" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.68rem', letterSpacing: '0.22em', color: '#94a3b8', textTransform: 'uppercase' }}>
                    OPERATIVE NAME
                  </div>
                  <div style={{ fontSize: '1.52rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '6px' }}>
                    {profile.name}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', fontSize: '0.66rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  PLAYER ID
                </div>
                <div style={{ fontWeight: 700, letterSpacing: '0.08em', marginTop: '6px' }}>{profile.playerId}</div>
              </div>
            </div>

            <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }}>
              {[
                { label: 'LEVEL', value: `0${profile.level}` },
                { label: 'XP', value: `${profile.xp.toLocaleString()} / ${profile.xpToNextLevel.toLocaleString()}` },
                { label: 'MATCHES', value: `${profile.totalMatches}` },
                { label: 'WINS', value: `${profile.wins}` },
              ].map((item) => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '14px 12px' }}>
                  <div style={{ fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8', fontSize: '0.63rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ marginTop: '10px', fontWeight: 800, fontSize: '1.12rem', letterSpacing: '0.05em' }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '22px', border: '1px solid rgba(0,240,255,0.18)', background: 'rgba(0,240,255,0.04)', borderRadius: '18px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.65rem', letterSpacing: '0.15em', color: '#94a3b8', textTransform: 'uppercase' }}>
                    EXP / LEVEL THRESHOLD
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '1.05rem', fontWeight: 700 }}>{profile.xp.toLocaleString()} / {profile.xpToNextLevel.toLocaleString()} XP</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', color: '#00ff9d', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {Math.round(progression.percent)}% TO NEXT LEVEL
                </div>
              </div>

              <div style={{ marginTop: '12px', height: '12px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progression.percent}%`,
                    borderRadius: 'inherit',
                    background: 'linear-gradient(90deg, #00f0ff 0%, #7c3aed 50%, #00ff9d 100%)',
                    boxShadow: isLeveling ? '0 0 30px rgba(0,240,255,0.8)' : 'none',
                    transition: 'width 0.6s ease, box-shadow 0.6s ease',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(11,17,28,0.82)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '26px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.66rem', letterSpacing: '0.18em', color: '#94a3b8', textTransform: 'uppercase' }}>Combat profile</div>
                <div style={{ marginTop: '8px', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{profile.favoriteStyle}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,255,157,0.08)', border: '1px solid rgba(0,255,157,0.2)', borderRadius: '999px', padding: '10px 14px', color: '#00ff9d', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                <Shield size={14} />
                {profile.adaptationScore}%
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              {[
                { label: 'LOSSES', value: `${profile.losses}` },
                { label: 'WIN RATE', value: `${profile.winRate}%` },
                { label: 'CURRENT STREAK', value: `${profile.currentStreak}` },
                { label: 'BEST STREAK', value: `${profile.bestStreak}` },
                { label: 'TOTAL DAMAGE', value: `${profile.totalDamage.toLocaleString()}` },
                { label: 'DAMAGE FOCUS', value: profile.favoriteStyle },
              ].map((item) => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '12px 10px' }}>
                  <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.62rem', letterSpacing: '0.12em', color: '#94a3b8', textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ marginTop: '8px', fontWeight: 700 }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              {([
                ['Victory', 'victory'],
                ['Adaptation', 'adaptation'],
                ['Lock-In', 'lock-in'],
              ] as const).map(([label, rewardType]) => (
                <button
                  key={rewardType}
                  type="button"
                  onClick={() => handleAwardReward(rewardType)}
                  style={{
                    flex: 1,
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    background: 'rgba(0, 240, 255, 0.07)',
                    color: '#dbeafe',
                    borderRadius: '12px',
                    padding: '10px 8px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.66rem',
                    letterSpacing: '0.12em',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  +{rewardType === 'victory' ? 100 : rewardType === 'adaptation' ? 50 : 75} XP
                  <div style={{ marginTop: '4px', color: '#00f0ff' }}>{label}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1.05fr 1.2fr', gap: '24px' }}>
          <div style={{ background: 'rgba(11,17,28,0.82)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '26px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} color="#00f0ff" />
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.66rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Fighting DNA</div>
            </div>

            <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
              {dnaMetrics.map((metric) => {
                const value = profile.fightingDNA[metric.key as keyof typeof profile.fightingDNA];
                return (
                  <div key={metric.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.62rem', letterSpacing: '0.12em', color: '#94a3b8', textTransform: 'uppercase' }}>{metric.label}</div>
                      <div style={{ fontWeight: 700, color: '#00f0ff' }}>{formatDNAValue(metric.key, value)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: 'rgba(11,17,28,0.82)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '26px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Gauge size={18} color="#00f0ff" />
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.66rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Combat intelligence</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00f0ff', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                <Flame size={12} />
                AI ADAPTATION ONLINE
              </div>
            </div>

            <div style={{ marginTop: '18px', display: 'grid', gap: '12px' }}>
              {[
                { label: 'Aggression', color: '#f97316', value: Math.round(profile.fightingDNA.aggression * 100) },
                { label: 'Defense', color: '#22c55e', value: Math.round(profile.fightingDNA.defense * 100) },
                { label: 'Mobility', color: '#38bdf8', value: Math.round(profile.fightingDNA.mobility * 100) },
                { label: 'Timing', color: '#c084fc', value: Math.round((1 - profile.fightingDNA.predictabilityIndex) * 100) },
              ].map((bar) => (
                <div key={bar.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '6px', color: '#cbd5e1', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    <span>{bar.label}</span>
                    <span>{bar.value}%</span>
                  </div>
                  <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${bar.value}%`, height: '100%', background: `linear-gradient(90deg, ${bar.color} 0%, rgba(255,255,255,0.8) 100%)`, borderRadius: 'inherit' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '22px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={16} color="#fbbf24" />
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.66rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Performance note</div>
              </div>
              <div style={{ marginTop: '12px', lineHeight: 1.7, color: '#dbeafe' }}>
                Operative adapts with <strong style={{ color: '#00f0ff' }}>{profile.adaptationScore}%</strong> neural precision, maintaining a <strong style={{ color: '#00ff9d' }}>{profile.winRate}%</strong> win rate across {profile.totalMatches} recorded engagements. Preferred combat rhythm remains <strong style={{ color: '#fbbf24' }}>{profile.favoriteStyle}</strong> with a measured focus on timing and mobility.
              </div>
            </div>
          </div>
        </section>

        <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.62rem', letterSpacing: '0.12em', color: '#94a3b8', textTransform: 'uppercase' }}>
            <Award size={14} color="#fbbf24" />
            Level {profile.level} // Active dossier
          </div>
          <button
            type="button"
            onClick={() => navigate('/analysis')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            DNA analysis <ChevronRight size={14} />
          </button>
        </div>
      </main>
    </div>
  );
};
