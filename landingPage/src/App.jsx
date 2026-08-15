import React, { useState, useEffect, useRef } from 'react';
import {
  Dumbbell,
  Play,
  Zap,
  Activity,
  Volume2,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Cpu,
  Eye,
  Database,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [simulatedRep, setSimulatedRep] = useState(7);
  const [simulatedAngle, setSimulatedAngle] = useState(88);
  const [simulatedFeedback, setSimulatedFeedback] = useState('Great depth on squat! Keep knees aligned.');

  const canvasRef = useRef(null);

  // Background Particles Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(79, 70, 229, 0.2)';
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.05)';

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Live simulation loop for AI preview box
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedAngle((prev) => {
        const next = prev < 160 ? prev + 12 : 75;
        if (next === 75) {
          setSimulatedRep((r) => r + 1);
          setSimulatedFeedback('Perfect form! Push through heels.');
        } else if (next === 111) {
          setSimulatedFeedback('Watch knee alignment, keep chest up!');
        }
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const legY = 120 + (180 - simulatedAngle) / 2;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }} />
      <div className="lp-grid-bg" />
      <div className="lp-glow-1" />

      <div className="container">
        {/* Navbar */}
        <nav className="nav glass-card">
          <a href="#" className="logo">
            <img
              src="/logo.svg"
              alt="myTrainer Logo"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                objectFit: 'contain',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            />
            <span>myTrainer AI</span>
          </a>

          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#exercises" className="nav-link">Exercises</a>
            <a href="#demo" className="nav-link">Live AI Demo</a>
            <a href="#contact" className="nav-link">Creator</a>
          </div>

          <a href="http://localhost:5173" className="btn-primary">
            Launch App <ArrowRight size={16} />
          </a>
        </nav>

        {/* Hero Section */}
        <section className="hero">
          <div className="badge">
            <div className="badge-dot" />
            <span>AI-POWERED · REAL-TIME · GYM COACH</span>
          </div>

          <h1 className="hero-title">
            Elevate Your Form.<br />
            <span className="gradient-text">Real-Time Computer Vision AI.</span>
          </h1>

          <p className="hero-sub">
            Instant pose tracking, millisecond joint angle calculations, and live voice coaching cues—all running locally in your browser.
          </p>

          <div className="hero-actions">
            <a href="http://localhost:5173" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.05rem', borderRadius: '14px' }}>
              <Play size={20} fill="#ffffff" /> Start Workout Now
            </a>
            <a href="#demo" className="btn-secondary">
              <Eye size={18} color="var(--accent-purple)" /> Watch Live Simulation
            </a>
          </div>

          {/* Metric Strip */}
          <div className="metrics-grid">
            <div className="metric-card glass-card">
              <div className="metric-num">~50ms</div>
              <div className="metric-label">Ultra-low Latency</div>
            </div>
            <div className="metric-card glass-card">
              <div className="metric-num">5+</div>
              <div className="metric-label">Supported Exercises</div>
            </div>
            <div className="metric-card glass-card">
              <div className="metric-num">95%+</div>
              <div className="metric-label">Form Accuracy</div>
            </div>
            <div className="metric-card glass-card">
              <div className="metric-num">100%</div>
              <div className="metric-label">Local SQLite History</div>
            </div>
          </div>
        </section>

        {/* Interactive AI Playground Card */}
        <section className="demo-card glass-card" id="demo">
          <div className="demo-header">
            <div>
              <span className="section-tag">// LIVE PREVIEW SIMULATION</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', color: '#0f172a' }}>
                Real-Time Pose Landmark & Voice Engine
              </h3>
            </div>
            <span className="pill-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              20 FPS ACTIVE
            </span>
          </div>

          <div className="demo-screen">
            <div className="scanline" />

            {/* Pose Wireframe Graphic Simulation */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <svg width="220" height="220" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="40" r="14" fill="#38bdf8" opacity="0.9" />
                <line x1="100" y1="54" x2="100" y2="120" stroke="#818cf8" strokeWidth="4" />
                <line x1="100" y1="70" x2="60" y2="100" stroke="#818cf8" strokeWidth="4" />
                <line x1="100" y1="70" x2="140" y2="100" stroke="#818cf8" strokeWidth="4" />
                <line x1="100" y1="120" x2="70" y2={legY} stroke="#38bdf8" strokeWidth="5" />
                <line x1="100" y1="120" x2="130" y2={legY} stroke="#38bdf8" strokeWidth="5" />
                <circle cx="100" cy="70" r="6" fill="#4f46e5" />
                <circle cx="60" cy="100" r="6" fill="#38bdf8" />
                <circle cx="140" cy="100" r="6" fill="#38bdf8" />
                <circle cx="100" cy="120" r="6" fill="#4f46e5" />
                <circle cx="70" cy={legY} r="6" fill="#10b981" />
                <circle cx="130" cy={legY} r="6" fill="#10b981" />
              </svg>
              <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.2rem', marginTop: '8px' }}>
                Squats · Knee Angle: <span style={{ color: '#38bdf8' }}>{simulatedAngle}°</span>
              </div>
            </div>

            {/* Floating Live AI Overlay Cues */}
            <div className="live-overlay">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#4f46e5', padding: '8px', borderRadius: '10px' }}>
                  <Volume2 size={18} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>AI VOICE COACH FEEDBACK</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>"{simulatedFeedback}"</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>COMPLETED REPS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{simulatedRep} Reps</div>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Exercises Showcase */}
        <section className="section" id="exercises">
          <div className="section-header">
            <span className="section-tag">// WORKOUT SUITE</span>
            <h2 className="section-title">Built for precision form analysis</h2>
          </div>

          <div className="exercise-grid">
            <div className="ex-card glass-card">
              <div className="ex-icon"><Activity size={24} /></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Squats</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Tracks knee extension, hip depth, and spinal alignment in real-time for maximum power and safety.
              </p>
              <div className="pill-badge">Depth & Back Angle</div>
            </div>

            <div className="ex-card glass-card">
              <div className="ex-icon"><Dumbbell size={24} /></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Push-ups</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Monitors elbow flare, core sag, and chest proximity to detect full range of motion.
              </p>
              <div className="pill-badge">Elbow & Alignment</div>
            </div>

            <div className="ex-card glass-card">
              <div className="ex-icon"><TrendingUp size={24} /></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Biceps Curls</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Detects momentum swinging, elbow drift, and top contraction peaks for hyper-isolated arm training.
              </p>
              <div className="pill-badge">Isolation & Swing</div>
            </div>

            <div className="ex-card glass-card">
              <div className="ex-icon"><Cpu size={24} /></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Shoulder Press</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Ensures overhead lockout stability, prevents back arching, and verifies symmetrical arm height.
              </p>
              <div className="pill-badge">Overhead Lockout</div>
            </div>

            <div className="ex-card glass-card">
              <div className="ex-icon"><Sparkles size={24} /></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Lunges</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Evaluates front knee clearance over toes, step depth, and posture balance across sets.
              </p>
              <div className="pill-badge">Knee & Balance</div>
            </div>

            <div className="ex-card glass-card" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0f2fe)', border: '1px dashed var(--accent-purple)' }}>
              <div className="ex-icon" style={{ background: '#ffffff' }}><Zap size={24} color="var(--accent-purple)" /></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>More Exercises</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Modular architecture allows continuous rollout of custom pose models and dynamic target tracking.
              </p>
              <div className="pill-badge" style={{ background: '#ffffff', color: 'var(--accent-purple)', borderColor: '#c7d2fe' }}>
                Modular AI Pipeline
              </div>
            </div>
          </div>
        </section>

        {/* Architecture & Features Section */}
        <section className="section" id="features">
          <div className="section-header">
            <span className="section-tag">// ARCHITECTURE & FEATURES</span>
            <h2 className="section-title">Engineered for high performance</h2>
          </div>

          <div className="features-grid">
            <div className="feat-card glass-card">
              <div className="ex-icon"><Eye size={24} /></div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>MediaPipe Computer Vision</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Detects 33 3D skeletal landmark coordinates in real-time for instant biomechanical angle calculations.
                </p>
              </div>
            </div>

            <div className="feat-card glass-card">
              <div className="ex-icon"><Volume2 size={24} /></div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>Groq AI Voice Feedback</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Generates natural, concise voice coaching tips via gTTS and fast Groq LLM logic when form errors occur.
                </p>
              </div>
            </div>

            <div className="feat-card glass-card">
              <div className="ex-icon"><Database size={24} /></div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>Local SQLite Persistence</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Stores completed sets, total rep logs, and session dates securely on your device for instant history review.
                </p>
              </div>
            </div>

            <div className="feat-card glass-card">
              <div className="ex-icon"><ShieldCheck size={24} /></div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>Zero Hardware Dependency</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Runs seamlessly on standard laptop webcams or mobile camera feeds through high-speed WebSockets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Creator & Footer Section */}
        <footer className="footer" id="contact">
          <div style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
            <span className="section-tag">// LET'S CONNECT</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '8px 0' }}>
              Built by a Human. Backed by Data.
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Open to opportunities in ML engineering, computer vision, and full-stack AI products.
            </p>
          </div>

          <div className="social-row">
            <a href="https://www.linkedin.com/in/prince-khunt-linked-in/" target="_blank" rel="noopener noreferrer" className="social-btn">
              LinkedIn
            </a>
            <a href="https://github.com/PrinceKhunt16" target="_blank" rel="noopener noreferrer" className="social-btn">
              GitHub
            </a>
            <a href="https://twitter.com/prince_khunt_" target="_blank" rel="noopener noreferrer" className="social-btn">
              Twitter / X
            </a>
            <a href="mailto:princekhunt04@gmail.com" className="social-btn">
              Email
            </a>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            © 2026 myTrainer AI — Real-Time Pose Detection & AI Gym Coaching
          </div>
        </footer>
      </div>
    </div>
  );
}
