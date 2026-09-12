import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Zap,
  Check,
  Eye,
} from 'lucide-react';
import { scanWeaponApi, type ScannedWeaponResult } from '../../services/api';
import { useSound } from '../../hooks/useSound';

interface CameraWeaponScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onEquip: (weapon: ScannedWeaponResult) => void;
}

export const CameraWeaponScanner: React.FC<CameraWeaponScannerProps> = ({
  isOpen,
  onClose,
  onEquip,
}) => {
  const { playSound } = useSound();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Scanner States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<ScannedWeaponResult | null>(null);
  const [selectedTargetItem, setSelectedTargetItem] = useState<string>('Book');
  const [shutterFlash, setShutterFlash] = useState(false);

  // Stop camera tracks helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Initialize camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsInitializing(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('NO_CAMERA_API: Browser does not support MediaDevices camera capture.');
      setIsInitializing(false);
      return;
    }

    try {
      stopCameraStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setCameraActive(true);
          setIsInitializing(false);
        };
      } else {
        setCameraActive(true);
        setIsInitializing(false);
      }
    } catch (err: any) {
      console.warn('[CAMERA] Error accessing camera hardware:', err);
      setIsInitializing(false);
      setCameraActive(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('CAMERA_PERMISSION_DENIED: Access was denied. Please allow camera permissions in your browser.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('NO_CAMERA_HARDWARE: No camera hardware detected on this device.');
      } else {
        setCameraError(`CAMERA_UNAVAILABLE: ${err.message || 'Unable to open camera stream.'}`);
      }
    }
  }, [stopCameraStream]);

  // Launch camera when modal opens
  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      startCamera();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCamera, stopCameraStream]);

  // Capture current camera frame & trigger synthesis
  const handleCaptureFrame = async (forcedItem?: string) => {
    playSound('pulse');
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 150);

    const itemToAnalyze = forcedItem || selectedTargetItem || 'Book';
    setIsAnalyzing(true);
    setScannedResult(null);

    // Visual sequence of neural analysis
    setAnalysisStep('ANALYZING OPTICAL TELEMETRY...');
    setTimeout(() => setAnalysisStep('SEGMENTING FOREGROUND OBJECT...'), 500);
    setTimeout(() => setAnalysisStep(`IDENTIFYING: ${itemToAnalyze.toUpperCase()} DETECTED`), 1000);
    setTimeout(() => setAnalysisStep('SYNTHESIZING MYTHICAL WEAPON LOADOUT...'), 1500);

    // Optional canvas frame grab
    let visualStats: Record<string, any> = { target: itemToAnalyze };
    if (videoRef.current && canvasRef.current && cameraActive) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, 320, 240);
          visualStats.frameCaptured = true;
        }
      } catch {
        // Continue gracefully
      }
    }

    try {
      const synthesized = await scanWeaponApi(itemToAnalyze, visualStats);
      setTimeout(() => {
        setScannedResult(synthesized);
        setIsAnalyzing(false);
        playSound('granted');
      }, 2000);
    } catch (err) {
      console.warn('[SCANNER] Synthesis API error, fallback activated:', err);
      setTimeout(() => {
        // Fallback weapon
        setScannedResult({
          detectedItem: 'Book',
          weapon: 'Tome of Wisdom',
          type: 'Staff',
          bonus: '+15% Ability Power',
          powerBonusPercent: 15,
          lore: 'Ancient codex inscribed with arcane quantum telemetry, amplifying strike resonance.',
          rarity: 'MYTHICAL',
          source: 'LOCAL_FALLBACK',
        });
        setIsAnalyzing(false);
        playSound('granted');
      }, 2000);
    }
  };

  const handleEquipAndClose = () => {
    if (scannedResult) {
      playSound('granted');
      onEquip(scannedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Camera Room Weapon Scanner"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 5, 10, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div
        className="cyber-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '620px',
          background: 'rgba(10, 15, 28, 0.98)',
          border: '1.5px solid rgba(0, 240, 255, 0.45)',
          borderRadius: '24px',
          boxShadow: '0 0 50px rgba(0, 240, 255, 0.25), inset 0 0 20px rgba(0, 240, 255, 0.08)',
          padding: '28px 28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Shutter White Flash Overlay */}
        {shutterFlash && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#ffffff',
              opacity: 0.85,
              zIndex: 100,
              pointerEvents: 'none',
              transition: 'opacity 0.15s ease-out',
            }}
          />
        )}

        {/* Modal Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(0, 240, 255, 0.12)',
                border: '1px solid rgba(0, 240, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={20} color="#00f0ff" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.68rem',
                  color: '#00f0ff',
                  letterSpacing: '0.14em',
                }}
              >
                OPTICAL SENSOR // REALITY RECOGNITION
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  margin: 0,
                  color: '#ffffff',
                  letterSpacing: '0.06em',
                }}
              >
                SCAN ROOM FOR WEAPON
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= CAMERA PREVIEW & SCAN FRAME ================= */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '270px',
            backgroundColor: '#050811',
            borderRadius: '16px',
            border: '1.5px solid rgba(0, 240, 255, 0.3)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Live Video Feed Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: cameraActive ? 'block' : 'none',
            }}
          />

          {/* Simulated / Fallback Screen when camera not active */}
          {!cameraActive && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center',
                gap: '12px',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.08) 0%, #050811 75%)',
              }}
            >
              {isInitializing ? (
                <>
                  <RefreshCw size={32} color="#00f0ff" className="animate-spin" />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#00f0ff' }}>
                    INITIALIZING CAMERA FEED...
                  </div>
                </>
              ) : cameraError ? (
                <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={32} color="#ffaa00" />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#ffcc00', lineHeight: '1.4' }}>
                    {cameraError}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: '#94a3b8' }}>
                    Cyber-Vision Simulation Mode activated. Point at any object or choose a test target below:
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Eye size={36} color="#00f0ff" />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#00f0ff' }}>
                    STANDBY // TARGET OBJECT IN FRAME
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scan Frame HUD Elements */}
          {/* Corner Brackets */}
          <div style={{ position: 'absolute', top: 12, left: 12, width: 20, height: 20, borderTop: '3px solid #00f0ff', borderLeft: '3px solid #00f0ff' }} />
          <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderTop: '3px solid #00f0ff', borderRight: '3px solid #00f0ff' }} />
          <div style={{ position: 'absolute', bottom: 12, left: 12, width: 20, height: 20, borderBottom: '3px solid #00f0ff', borderLeft: '3px solid #00f0ff' }} />
          <div style={{ position: 'absolute', bottom: 12, right: 12, width: 20, height: 20, borderBottom: '3px solid #00f0ff', borderRight: '3px solid #00f0ff' }} />

          {/* Center Targeting Reticle */}
          <div
            style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '1px dashed rgba(0, 240, 255, 0.4)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }} />
          </div>

          {/* Sweeping Laser Animation Line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, #00f0ff 50%, transparent 100%)',
              boxShadow: '0 0 15px #00f0ff, 0 0 30px #00f0ff',
              animation: 'scannerSweep 1.5s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />

          {/* HUD Overlay Labels */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 36,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.64rem',
              color: cameraActive ? '#00ff9d' : '#ffaa00',
              letterSpacing: '0.12em',
              background: 'rgba(0,0,0,0.6)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {cameraActive ? '● OPTICAL FEED ACTIVE' : '○ SIMULATION RUNTIME'}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 14,
              right: 36,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.64rem',
              color: 'var(--text-muted, #94a3b8)',
              background: 'rgba(0,0,0,0.6)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            AI_VISION // RES: 640x480
          </div>
        </div>

        {/* Target Object Selector (MVP Helper & Desktop Convenience) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              TARGET ROOM OBJECT (AI CLASSIFICATION TEST):
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#00f0ff' }}>
              SELECTED: {selectedTargetItem.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { label: 'Book', tag: 'Book' },
              { label: 'Coffee Mug', tag: 'Coffee Mug' },
              { label: 'Pen', tag: 'Pen' },
              { label: 'Smartphone', tag: 'Smartphone' },
              { label: 'Water Bottle', tag: 'Water Bottle' },
              { label: 'Keyboard', tag: 'Keyboard' },
            ].map((obj) => (
              <button
                key={obj.tag}
                type="button"
                onClick={() => {
                  setSelectedTargetItem(obj.tag);
                  playSound('hover');
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: selectedTargetItem === obj.tag ? 700 : 500,
                  background:
                    selectedTargetItem === obj.tag
                      ? 'rgba(0, 240, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  border:
                    selectedTargetItem === obj.tag
                      ? '1px solid #00f0ff'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  color: selectedTargetItem === obj.tag ? '#00f0ff' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {obj.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= LOADING STATE ================= */}
        {isAnalyzing && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'rgba(0, 240, 255, 0.06)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <RefreshCw size={24} color="#00f0ff" className="animate-spin" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
              <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.84rem', color: '#00f0ff', fontWeight: 700 }}>
                {analysisStep}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Synthesizing everyday geometry into battle-grade cyber weapon...
              </span>
            </div>
          </div>
        )}

        {/* ================= RESULT DISPLAY ================= */}
        {scannedResult && !isAnalyzing && (
          <div
            style={{
              padding: '20px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.08) 0%, rgba(0, 240, 255, 0.08) 100%)',
              border: '1.5px solid rgba(0, 255, 157, 0.45)',
              boxShadow: '0 0 30px rgba(0, 255, 157, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header / Item tag */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#00ff9d" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#00ff9d', fontWeight: 700 }}>
                  OBJECT DETECTED: {scannedResult.detectedItem.toUpperCase()}
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: '#000000',
                  background: '#00ff9d',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                }}
              >
                {scannedResult.rarity}
              </span>
            </div>

            {/* Weapon Name & Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  WEAPON:
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '0.04em',
                  }}
                >
                  {scannedResult.weapon}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  TYPE:
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#00f0ff',
                  }}
                >
                  {scannedResult.type}
                </div>
              </div>
            </div>

            {/* Weapon Bonus */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '8px',
              }}
            >
              <Zap size={18} color="#00ff9d" />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  BONUS:
                </div>
                <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', color: '#00ff9d', fontWeight: 800 }}>
                  {scannedResult.bonus}
                </div>
              </div>
            </div>

            {/* Weapon Lore */}
            {scannedResult.lore && (
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary, #94a3b8)',
                  fontStyle: 'italic',
                  lineHeight: '1.4',
                }}
              >
                "{scannedResult.lore}"
              </div>
            )}
          </div>
        )}

        {/* ================= MODAL ACTIONS ================= */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          {!scannedResult ? (
            <button
              type="button"
              id="capture-analyze-button"
              onClick={() => handleCaptureFrame()}
              disabled={isAnalyzing}
              style={{
                flex: 1,
                padding: '16px',
                background: 'linear-gradient(135deg, #00f0ff 0%, #0077ff 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <Camera size={20} />
              <span>{isAnalyzing ? 'ANALYZING OBJECT...' : 'CAPTURE & SYNTHESIZE WEAPON'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setScannedResult(null)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-hud)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <RefreshCw size={16} />
                <span>SCAN ANOTHER</span>
              </button>

              <button
                type="button"
                id="equip-scanned-weapon-button"
                onClick={handleEquipAndClose}
                style={{
                  flex: 1.6,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #00ff9d 0%, #00f0ff 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#000000',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(0, 255, 157, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Check size={18} strokeWidth={3} />
                <span>EQUIP TO LOADOUT</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
