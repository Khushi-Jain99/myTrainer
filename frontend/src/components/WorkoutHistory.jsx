import React, { useEffect, useState } from 'react';
import { History, Calendar, Clock, Award, RefreshCw } from 'lucide-react';

export default function WorkoutHistory({ user, refreshTrigger }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/user/history?user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.aggregated || []);
      }
    } catch (err) {
      console.error('Failed to load workout history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, refreshTrigger]);

  return (
    <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} color="var(--accent-cyan)" /> Workout History
        </h3>
        <button
          onClick={fetchHistory}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={12} className={loading ? 'pulse-accent' : ''} /> Refresh
        </button>
      </div>

      {history.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>#</th>
                <th style={{ padding: '12px 14px' }}>Exercise</th>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px' }}>Total Sets</th>
                <th style={{ padding: '12px 14px' }}>Total Reps</th>
                <th style={{ padding: '12px 14px' }}>Time (sec)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{idx + 1}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--accent-cyan)' }}>{row.Exercise}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{row.Date}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{row.Sets}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--accent-green)' }}>{row.Reps}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>{row['Time (sec)']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '10px'
        }}>
          <p style={{ fontSize: '0.95rem' }}>No workout history found yet. Complete a workout set to view your logs here!</p>
        </div>
      )}
    </div>
  );
}
