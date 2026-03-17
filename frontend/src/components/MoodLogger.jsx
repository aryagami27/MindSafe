import { useState } from 'react';
import { api } from '../api';

const MOOD_EMOJIS = [
  { score: 1, emoji: '😞', label: 'Awful' },
  { score: 2, emoji: '😢', label: 'Bad' },
  { score: 3, emoji: '😟', label: 'Low' },
  { score: 4, emoji: '😕', label: 'Meh' },
  { score: 5, emoji: '😐', label: 'OK' },
  { score: 6, emoji: '🙂', label: 'Fine' },
  { score: 7, emoji: '😊', label: 'Good' },
  { score: 8, emoji: '😄', label: 'Great' },
  { score: 9, emoji: '🤩', label: 'Amazing' },
  { score: 10, emoji: '🥳', label: 'Incredible' },
];

export default function MoodLogger({ onLogSubmitted }) {
  const [score, setScore] = useState(5);
  const [journal, setJournal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const data = await api.submitMoodLog({
        mood_score: score,
        journal_entry: journal || null,
      });
      setResult({ type: 'success', message: 'Mood logged! Keep it up 💪' });
      setJournal('');
      if (onLogSubmitted) onLogSubmitted(data);
    } catch (err) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const currentEmoji = MOOD_EMOJIS[score - 1];

  return (
    <form onSubmit={handleSubmit} className="glass-card animate-in" style={{ marginTop: 16 }}>
      <h3 style={{ marginBottom: 4 }}>📋 Daily Check-in</h3>
      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 16 }}>How are you feeling right now?</p>

      {/* Big emotion display */}
      <div className="text-center" style={{ marginBottom: 16 }}>
        <span style={{
          fontSize: '3.5rem',
          display: 'block',
          transition: 'transform 0.3s ease',
          transform: `scale(${1 + (score - 5) * 0.03})`
        }}>
          {currentEmoji.emoji}
        </span>
        <span className="gradient-text" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
          {currentEmoji.label}
        </span>
        <span className="text-muted" style={{ marginLeft: 8, fontSize: '0.85rem' }}>
          ({score}/10)
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={1}
        max={10}
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        style={{ marginBottom: 8 }}
      />

      {/* Emoji quick-select row */}
      <div className="emoji-row" style={{ marginBottom: 20 }}>
        {MOOD_EMOJIS.filter((_, i) => i % 2 === 0).map((m) => (
          <button
            type="button"
            key={m.score}
            className={`emoji-btn ${score === m.score ? 'selected' : ''}`}
            onClick={() => setScore(m.score)}
          >
            {m.emoji}
          </button>
        ))}
      </div>

      {/* Journal */}
      <div className="input-group" style={{ marginBottom: 16 }}>
        <label>✏️ Journal (optional — helps detect stress patterns)</label>
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          placeholder="What's on your mind today? How was studying?"
          rows={3}
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? '⏳ Saving...' : '💾 Log My Mood'}
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
