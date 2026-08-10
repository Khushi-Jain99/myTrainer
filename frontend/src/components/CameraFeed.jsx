import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Video, Sliders } from 'lucide-react';

export default function CameraFeed({ workoutStarted, user, exercise, onMetricsUpdate, onVoiceFeedback }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [processedFrame, setProcessedFrame] = useState(null);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let intervalId = null;
    let streamInstance = null;
    let lastTime = performance.now();
    let frameCount = 0;

    if (workoutStarted) {
      // 1. Connect WebSocket
      const wsUrl = `ws://localhost:8000/ws/pose`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStreamActive(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.processed_frame) {
            setProcessedFrame(data.processed_frame);
          }
          if (data.metrics) {
            onMetricsUpdate(data.metrics);
          }
          if (data.voice_feedback) {
            onVoiceFeedback(data.voice_feedback);
          }

          frameCount++;
          const now = performance.now();
          if (now - lastTime >= 1000) {
            setFps(Math.round((frameCount * 1000) / (now - lastTime)));
            frameCount = 0;
            lastTime = now;
          }
        } catch (e) {
          console.error('Error handling pose websocket msg:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
      };

      ws.onclose = () => {
        setStreamActive(false);
      };

      // 2. Access Camera Stream
      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 480, frameRate: { ideal: 30 } }, audio: false })
        .then((stream) => {
          streamInstance = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }

          // 3. Start frame capture loop
          intervalId = setInterval(() => {
            if (
              ws.readyState === WebSocket.OPEN &&
              videoRef.current &&
              canvasRef.current
            ) {
              const video = videoRef.current;
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              if (video.videoWidth > 0 && video.videoHeight > 0) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const frameBase64 = canvas.toDataURL('image/jpeg', 0.6);
                ws.send(
                  JSON.stringify({
                    frame: frameBase64,
                    user_id: user?.id || 0,
                    exercise: exercise,
                  })
                );
              }
            }
          }, 50); // ~20 fps
        })
        .catch((err) => {
          console.error('Camera access error:', err);
        });
    } else {
      setStreamActive(false);
      setProcessedFrame(null);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (streamInstance) {
        streamInstance.getTracks().forEach((track) => track.stop());
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [workoutStarted, exercise]);

  return (
    <div className="glass-card" style={{ padding: '20px', minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <Video size={20} color="var(--accent-purple)" /> Live AI Motion Feed
        </h3>
        {workoutStarted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: streamActive ? '#ecfdf5' : '#fef2f2',
              color: streamActive ? 'var(--accent-green)' : 'var(--accent-red)',
              border: streamActive ? '1px solid #a7f3d0' : '1px solid #fecaca',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: streamActive ? 'var(--accent-green)' : 'var(--accent-red)'
              }} />
              {streamActive ? `LIVE (${fps} FPS)` : 'CONNECTING'}
            </span>
          </div>
        )}
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        flex: 1,
        minHeight: '360px',
        background: workoutStarted ? '#0f172a' : '#f8fafc',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-color)'
      }}>
        {/* Hidden video & canvas for frame grabbing */}
        <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {workoutStarted ? (
          processedFrame ? (
            <img
              src={processedFrame}
              alt="Pose Feed"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ color: '#94a3b8', textAlign: 'center' }}>
              <div className="audio-wave-bar" />
              <div className="audio-wave-bar" />
              <div className="audio-wave-bar" />
              <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Initializing AI Pose landmarker feed...</p>
            </div>
          )
        ) : (
          <div style={{
            border: '2px dashed #cbd5e1',
            background: '#ffffff',
            borderRadius: '12px',
            width: '90%',
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            <Sliders size={48} color="var(--accent-purple)" style={{ opacity: 0.8, marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '8px', fontWeight: 700 }}>
              👈 Set your workout plan
            </h3>
            <p style={{ fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5', color: 'var(--text-muted)' }}>
              Choose your exercise, target sets, and reps in the sidebar panel,<br />
              then click <strong>Start Workout</strong> to activate camera tracking and your AI coach.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

