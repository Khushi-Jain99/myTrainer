import React from 'react';
import { Play, Square, Activity, Target, Flame, ChevronRight } from 'lucide-react';

export default function Sidebar({
  exerciseOptions,
  selectedExercise,
  setSelectedExercise,
  targetSets,
  setTargetSets,
  repsPerSet,
  setRepsPerSet,
  workoutStarted,
  onStartWorkout,
  onEndWorkout,
  metrics,
}) {
  return (
    <aside className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Target size={18} color="var(--accent-cyan)" /> Workout Plan
        </h3>

        {!workoutStarted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                Exercise
              </label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              >
                {exerciseOptions.map((ex) => (
                  <option key={ex} value={ex} style={{ background: '#121824' }}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  Target Sets
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={targetSets}
                  onChange={(e) => setTargetSets(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  Reps per Set
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={repsPerSet}
                  onChange={(e) => setRepsPerSet(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              onClick={onStartWorkout}
              className="btn-primary pulse-accent"
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Play size={18} fill="#000" /> Start Workout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              padding: '14px',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Exercise
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>
                {selectedExercise}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Target: {targetSets} Sets × {repsPerSet} Reps
              </div>
            </div>

            <button
              onClick={onEndWorkout}
              className="btn-danger"
              style={{ width: '100%' }}
            >
              <Square size={18} fill="#fff" /> End Workout
            </button>
          </div>
        )}
      </div>

      {workoutStarted && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <h4 style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            marginBottom: '14px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Activity size={16} color="var(--accent-cyan)" /> Live Progress Metrics
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px 14px',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Reps</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {metrics?.reps || 0}
              </span>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px 14px',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Set Reps</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {metrics?.current_set_reps || 0} / {repsPerSet}
              </span>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px 14px',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sets Completed</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                {metrics?.sets_completed || 0} / {targetSets}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '18px' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
              Form & Angles ({selectedExercise})
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedExercise === 'Squats' && (
                <>
                  <MetricRow label="Knee Angle" value={`${metrics?.knee_angle || 0}°`} />
                  <MetricRow label="Back Angle" value={`${metrics?.back_angle || 0}°`} />
                  <MetricRow label="Depth" value={metrics?.depth_status || 'N/A'} isBadge />
                </>
              )}

              {selectedExercise === 'Push-ups' && (
                <>
                  <MetricRow label="Elbow Angle" value={`${metrics?.elbow_angle || 0}°`} />
                  <MetricRow label="Alignment" value={metrics?.body_alignment || 'N/A'} isBadge />
                  <MetricRow label="Hip Status" value={metrics?.hip_status || 'N/A'} isBadge />
                </>
              )}

              {selectedExercise === 'Biceps Curls (Dumbbell)' && (
                <>
                  <MetricRow label="Elbow Angle" value={`${metrics?.elbow_angle || 0}°`} />
                  <MetricRow label="Shoulder" value={metrics?.shoulder_status || 'N/A'} isBadge />
                  <MetricRow label="Swing" value={metrics?.swing_status || 'N/A'} isBadge />
                </>
              )}

              {selectedExercise === 'Shoulder Press' && (
                <>
                  <MetricRow label="Elbow Angle" value={`${metrics?.elbow_angle || 0}°`} />
                  <MetricRow label="Extension" value={metrics?.extension_status || 'N/A'} isBadge />
                  <MetricRow label="Back Arch" value={metrics?.back_arch_status || 'N/A'} isBadge />
                </>
              )}

              {selectedExercise === 'Lunges' && (
                <>
                  <MetricRow label="Front Knee Angle" value={`${metrics?.front_knee_angle || 0}°`} />
                  <MetricRow label="Torso Angle" value={`${metrics?.torso_angle || 0}°`} />
                  <MetricRow label="Balance" value={metrics?.balance_status || 'N/A'} isBadge />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function MetricRow({ label, value, isBadge }) {
  let badgeClass = 'badge-good';
  if (value === 'TOO HIGH' || value === 'Poor Form' || value === 'OFF BALANCE' || value === 'SWINGING' || value === 'Excessive Arch') {
    badgeClass = 'badge-danger';
  } else if (value === 'Slight Bend' || value === 'ELBOW DRIFTING' || value === 'Slight Arch') {
    badgeClass = 'badge-warn';
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '8px',
      fontSize: '0.85rem'
    }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      {isBadge ? (
        <span className={badgeClass}>{value}</span>
      ) : (
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{value}</span>
      )}
    </div>
  );
}
