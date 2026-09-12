import React, { useEffect, useState } from 'react';

const TELEMETRY_LINES = [
  'AI_CORE_INITIALIZING',
  'PLAYER_PROFILE_SCAN',
  'BEHAVIOR_ENGINE_READY',
  'NEXUS_PROTOCOL_V4',
  'COMBAT_ANALYSIS_SYNC',
  'DNA_ENGINE_ACTIVE',
  'ADAPTIVE_INTELLIGENCE',
  'NEURAL_SYNC_OPTIMAL',
  'LATENCY_12MS_ESTABLISHED',
  'TACTICAL_PREDICTION_READY',
  'QUANTUM_ENCRYPTION_LOCKED',
  'PATTERN_RECOGNITION_99.8%',
];

interface StreamItem {
  id: number;
  text: string;
  left: string;
  top: string;
  duration: number;
  delay: number;
  color: string;
}

export const DataStream: React.FC = () => {
  const [streams, setStreams] = useState<StreamItem[]>([]);

  useEffect(() => {
    // Generate randomized gentle floating data telemetry tags
    const items: StreamItem[] = Array.from({ length: 8 }).map((_, index) => ({
      id: index,
      text: TELEMETRY_LINES[Math.floor(Math.random() * TELEMETRY_LINES.length)],
      left: `${(index * 13 + Math.random() * 8) % 85 + 5}%`,
      top: `${Math.random() * 70 + 15}%`,
      duration: Math.random() * 6 + 9, // 9 - 15s
      delay: Math.random() * 4,
      color: Math.random() > 0.3 ? 'rgba(0, 240, 255, 0.22)' : 'rgba(157, 78, 221, 0.22)',
    }));

    setStreams(items);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {streams.map(item => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: item.left,
            top: item.top,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            letterSpacing: '0.14em',
            color: item.color,
            textShadow: '0 0 6px rgba(0, 240, 255, 0.2)',
            animation: `floatTelemetry ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          <span style={{ opacity: 0.5, marginRight: '4px' }}>//</span>
          {item.text}
        </div>
      ))}

      <style>{`
        @keyframes floatTelemetry {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          25% {
            opacity: 0.45;
          }
          75% {
            opacity: 0.45;
          }
          100% {
            opacity: 0;
            transform: translateY(-40px);
          }
        }
      `}</style>
    </div>
  );
};
