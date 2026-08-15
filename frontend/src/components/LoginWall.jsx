import React, { useState } from 'react';
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export default function LoginWall({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      onLogin(data);
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh'
    }}>
      <div className="glass-card-interactive" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '40px 32px',
        textAlign: 'center'
      }}>
        <img
          src="/logo.svg"
          alt="myTrainer Logo"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            margin: '0 auto 20px',
            display: 'block',
            objectFit: 'contain',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)'
          }}
        />

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
          AI Real-time GYM Trainer
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Enter a username to begin your workout session with real-time pose tracking & AI voice cues.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
              Username / Name (Unique)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. princekhunt"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                fontSize: '1rem',
                fontWeight: 600,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {error && (
            <div style={{
              color: 'var(--accent-red)',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px' }}
          >
            {loading ? 'Starting Session...' : 'Start Session'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

