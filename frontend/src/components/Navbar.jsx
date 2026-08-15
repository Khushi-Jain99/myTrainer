import React from 'react';
import { User, LogOut, Activity } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  return (
    <header className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo.svg"
            alt="myTrainer Logo"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              objectFit: 'contain',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
            }}
          />
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #0f172a, #4338ca)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              My Trainer
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={12} color="var(--accent-purple)" /> Real-time Pose Detection & Voice AI
            </p>
          </div>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: '#f1f5f9',
              border: '1px solid var(--border-color)',
              padding: '8px 14px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              <User size={16} color="var(--accent-purple)" />
              <span style={{ color: 'var(--text-main)' }}>{user.username}</span>
            </div>

            <button
              onClick={onLogout}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                padding: '8px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-red)';
                e.currentTarget.style.color = 'var(--accent-red)';
                e.currentTarget.style.background = '#fef2f2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              <LogOut size={14} /> Exit
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

