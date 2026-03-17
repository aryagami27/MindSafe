import { useState } from 'react';
import { api, setToken } from '../api';

export default function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.register();
      setToken(data.access_token);
      onLogin(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen flex flex-col items-center justify-center" style={{ minHeight: '100vh', gap: '32px' }}>
      {/* Hero glow orb */}
      <div className="hero-orb animate-float" style={{
        width: 120, height: 120, borderRadius: '50%',
        background: 'var(--gradient-primary)',
        filter: 'blur(2px)',
        boxShadow: '0 0 80px rgba(139, 92, 246, 0.4), 0 0 160px rgba(6, 182, 212, 0.2)',
        opacity: 0.85
      }} />

      <div className="animate-in" style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: 8 }}>
          <span className="gradient-text">MindSafe</span>
        </h1>
        <p className="text-secondary" style={{ fontSize: '1rem', maxWidth: 300, margin: '0 auto' }}>
          Your anonymous, private mental health companion for academic life.
        </p>
      </div>

      <div className="glass-card animate-in animate-in-delay-2" style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: '2.5rem' }}>🛡️</span>
          <h3 style={{ marginTop: 12 }}>100% Anonymous</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 6 }}>
            No email. No name. No tracking. Just a secure token to protect your data.
          </p>
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? '⏳ Creating your safe space...' : '✨ Start Anonymously'}
        </button>

        {error && (
          <p style={{ color: 'var(--accent-rose)', marginTop: 12, fontSize: '0.85rem' }}>
            {error}
          </p>
        )}
      </div>

      <p className="text-muted animate-in animate-in-delay-3" style={{ fontSize: '0.75rem', textAlign: 'center', maxWidth: 280 }}>
        Built with care for college students. Your wellbeing matters.
      </p>
    </div>
  );
}
