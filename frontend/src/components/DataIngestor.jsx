import { useState } from 'react';
import { api } from '../api';

export default function DataIngestor({ onDataSubmitted }) {
  const [sleepHours, setSleepHours] = useState(7);
  const [screenTime, setScreenTime] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const data = await api.submitDataMarkers({
        sleep_hours: sleepHours,
        study_screen_time_hours: screenTime,
      });
      setResult({ type: 'success', message: 'Data recorded! 🌙' });
      if (onDataSubmitted) onDataSubmitted(data);
    } catch (err) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  function getSleepStatus() {
    if (sleepHours < 4) return { color: 'var(--accent-rose)', label: '⚠️ Critical', desc: 'This is dangerously low sleep' };
    if (sleepHours < 6) return { color: 'var(--accent-amber)', label: '😴 Low', desc: 'Below recommended amount' };
    if (sleepHours < 8) return { color: 'var(--accent-green)', label: '✅ Good', desc: 'Healthy sleep range' };
    return { color: 'var(--accent-cyan)', label: '💤 Great', desc: 'Excellent rest!' };
  }

  const sleepStatus = getSleepStatus();

  return (
    <form onSubmit={handleSubmit} className="glass-card animate-in" style={{ marginTop: 16 }}>
      <h3 style={{ marginBottom: 4 }}>🌙 Passive Data</h3>
      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 20 }}>
        Log your sleep and study hours for passive stress detection.
      </p>

      {/* Sleep hours */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>😴 Sleep Duration</label>
          <span style={{
            color: sleepStatus.color,
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            {sleepStatus.label}
          </span>
        </div>

        <div className="flex items-center gap-md">
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{
            fontWeight: 700,
            fontSize: '1.3rem',
            minWidth: 52,
            textAlign: 'right',
            color: sleepStatus.color,
          }}>
            {sleepHours}h
          </span>
        </div>
        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
          {sleepStatus.desc}
        </p>
      </div>

      {/* Screen time */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>📱 Study / Screen Time</label>
          <span style={{
            color: screenTime > 10 ? 'var(--accent-rose)' : screenTime > 6 ? 'var(--accent-amber)' : 'var(--accent-green)',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            {screenTime > 10 ? '⚠️ Very High' : screenTime > 6 ? '📖 High' : '✅ Normal'}
          </span>
        </div>

        <div className="flex items-center gap-md">
          <input
            type="range"
            min={0}
            max={16}
            step={0.5}
            value={screenTime}
            onChange={(e) => setScreenTime(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{
            fontWeight: 700,
            fontSize: '1.3rem',
            minWidth: 52,
            textAlign: 'right',
          }}>
            {screenTime}h
          </span>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? '⏳ Recording...' : '📊 Record Data'}
      </button>

      {result && (
        <p style={{
          marginTop: 12,
          fontSize: '0.85rem',
          color: result.type === 'success' ? 'var(--accent-green)' : 'var(--accent-rose)',
          textAlign: 'center'
        }}>
          {result.message}
        </p>
      )}
    </form>
  );
}
