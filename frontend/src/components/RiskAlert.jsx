import { useState } from 'react';
import { api } from '../api';

const RISK_CONFIG = {
  'High': {
    color: 'var(--accent-rose)',
    bgGlow: 'rgba(244, 63, 94, 0.1)',
    border: 'rgba(244, 63, 94, 0.25)',
    icon: '🚨',
    title: 'High Risk Detected',
    action: 'We strongly recommend connecting with a counselor or crisis line immediately.',
    resources: [
      { label: '📞 Crisis Helpline', desc: 'Talk to someone now (1-800-273-8255)' },
      { label: '🏥 Campus Counseling', desc: 'Book a fast-track anonymous session' },
    ]
  },
  'Medium': {
    color: 'var(--accent-amber)',
    bgGlow: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.25)',
    icon: '⚡',
    title: 'Elevated Stress',
    action: 'Consider reaching out to peer support or trying some stress-relief techniques.',
    resources: [
      { label: '🤝 Peer Support', desc: 'Connect with a trained student listener' },
      { label: '🧘 Mindfulness', desc: 'Try a guided breathing exercise' },
    ]
  },
  'Safe/Low': {
    color: 'var(--accent-green)',
    bgGlow: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.25)',
    icon: '✅',
    title: 'Looking Good!',
    action: 'Your indicators are within healthy ranges. Keep up the great habits!',
    resources: [
      { label: '🎯 Daily Tip', desc: 'Stay hydrated and take regular study breaks' },
      { label: '🌿 Self Care', desc: 'Remember to do something you enjoy today' },
    ]
  },
};

export default function RiskAlert() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState(null);

  async function handleCheck() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeStress();
      setAlert(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const config = alert ? (RISK_CONFIG[alert.current_alert] || RISK_CONFIG['Safe/Low']) : null;

  return (
    <div className="animate-in" style={{ marginTop: 16 }}>
      {/* Check button */}
      <div className="glass-card" style={{ textAlign: 'center', marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8 }}>🔍 Stress Analysis</h3>
        <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 16 }}>
          Run the early detection engine on your recent data.
        </p>
        <button className="btn btn-primary btn-block" onClick={handleCheck} disabled={loading}>
          {loading ? '⏳ Analyzing...' : '🧠 Analyze My Stress Level'}
        </button>
        {error && (
          <p style={{ color: 'var(--accent-rose)', marginTop: 12, fontSize: '0.85rem' }}>{error}</p>
        )}
      </div>

      {/* Result card */}
      {alert && config && (
        <div className="glass-card animate-in" style={{
          borderColor: config.border,
          background: config.bgGlow,
        }}>
          {/* Header */}
          <div className="flex items-center gap-md" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: '2.5rem' }}>{config.icon}</span>
            <div>
              <h3 style={{ color: config.color }}>{config.title}</h3>
              <span className={`badge badge-${alert.current_alert === 'High' ? 'high' : alert.current_alert === 'Medium' ? 'medium' : 'low'}`}>
                {alert.current_alert}
              </span>
            </div>
          </div>

          {/* Reason */}
          <p style={{ fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.5 }}>
            {alert.reason}
          </p>

          {/* Action */}
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-glass)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            borderLeft: `3px solid ${config.color}`,
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {config.action}
            </p>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-sm">
            {config.resources.map((r, i) => (
              <div key={i} style={{
                padding: '12px 16px',
                background: 'var(--bg-glass-hover)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.label}</span>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 2 }}>{r.desc}</p>
              </div>
            ))}
          </div>

          {/* Exam period nudge */}
          {alert.exam_nudge_active && (
            <div style={{
              marginTop: 16,
              padding: '12px 16px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}>
              <p style={{ fontSize: '0.85rem' }}>
                📚 <strong>Exam Period Active</strong> — Extra support resources and mindfulness nudges are enabled during this high-stress period.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
