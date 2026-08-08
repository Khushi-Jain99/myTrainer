import React, { useEffect, useRef } from 'react';
import { Bot, Volume2 } from 'lucide-react';

export default function CoachBanner({ coachFeedback }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (coachFeedback?.audio && audioRef.current) {
      audioRef.current.src = `data:audio/mp3;base64,${coachFeedback.audio}`;
      audioRef.current
        .play()
        .catch((e) => console.log('Audio autoplay prevented or interrupted:', e));
    }
  }, [coachFeedback]);

  if (!coachFeedback || !coachFeedback.text) {
    return null;
  }

  return (
    <div
      className="glass-card pulse-accent"
      style={{
        padding: '16px 20px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(124, 77, 255, 0.12))',
        border: '1px solid rgba(0, 229, 255, 0.3)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}
    >
      <div
        style={{
          background: 'var(--accent-cyan)',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Bot size={22} color="#000" />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🤖 My Trainer Voice Cue
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginTop: '2px' }}>
          "{coachFeedback.text}"
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div className="audio-wave-bar" />
        <div className="audio-wave-bar" />
        <div className="audio-wave-bar" />
        <Volume2 size={18} color="var(--accent-cyan)" style={{ marginLeft: '6px' }} />
      </div>

      {/* Hidden audio element for TTS playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
