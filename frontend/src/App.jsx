import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginWall from './components/LoginWall';
import Sidebar from './components/Sidebar';
import CameraFeed from './components/CameraFeed';
import CoachBanner from './components/CoachBanner';
import WorkoutHistory from './components/WorkoutHistory';
import { API_BASE_URL } from './config';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('myTrainer_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [exerciseOptions, setExerciseOptions] = useState([
    'Squats',
    'Push-ups',
    'Biceps Curls (Dumbbell)',
    'Shoulder Press',
    'Lunges'
  ]);
  const [selectedExercise, setSelectedExercise] = useState('Squats');
  const [targetSets, setTargetSets] = useState(3);
  const [repsPerSet, setRepsPerSet] = useState(10);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [coachFeedback, setCoachFeedback] = useState(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/config`)
      .then((res) => res.json())
      .then((data) => {
        if (data.exercise_options) {
          setExerciseOptions(data.exercise_options);
        }
      })
      .catch((err) => console.log('Could not load config from backend:', err));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('myTrainer_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('myTrainer_user');
    setWorkoutStarted(false);
  };

  const handleStartWorkout = async () => {
    setWorkoutStarted(true);
    setMetrics({});
    setCoachFeedback(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/workout/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 0,
          exercise: selectedExercise,
          target_sets: targetSets,
          reps_per_set: repsPerSet
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.coach_text || data.audio_base64) {
          setCoachFeedback({
            text: data.coach_text,
            audio: data.audio_base64
          });
        }
      }
    } catch (e) {
      console.error('Failed to trigger start workout API:', e);
    }
  };

  const handleEndWorkout = async () => {
    setWorkoutStarted(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/workout/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 0,
          exercise: selectedExercise
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.coach_text || data.audio_base64) {
          setCoachFeedback({
            text: data.coach_text,
            audio: data.audio_base64
          });
        }
      }
    } catch (e) {
      console.error('Failed to trigger end workout API:', e);
    }
    setHistoryRefresh((prev) => prev + 1);
  };

  const handleVoiceFeedback = (feedback) => {
    if (feedback && (feedback.text || feedback.audio)) {
      setCoachFeedback(feedback);
      setHistoryRefresh((prev) => prev + 1);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <Navbar user={user} onLogout={handleLogout} />

      {!user ? (
        <LoginWall onLogin={handleLogin} />
      ) : (
        <main>
          <CoachBanner coachFeedback={coachFeedback} />

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
            <Sidebar
              exerciseOptions={exerciseOptions}
              selectedExercise={selectedExercise}
              setSelectedExercise={setSelectedExercise}
              targetSets={targetSets}
              setTargetSets={setTargetSets}
              repsPerSet={repsPerSet}
              setRepsPerSet={setRepsPerSet}
              workoutStarted={workoutStarted}
              onStartWorkout={handleStartWorkout}
              onEndWorkout={handleEndWorkout}
              metrics={metrics}
            />

            <CameraFeed
              workoutStarted={workoutStarted}
              user={user}
              exercise={selectedExercise}
              onMetricsUpdate={setMetrics}
              onVoiceFeedback={handleVoiceFeedback}
            />
          </div>

          <WorkoutHistory user={user} refreshTrigger={historyRefresh} />
        </main>
      )}
    </div>
  );
}
