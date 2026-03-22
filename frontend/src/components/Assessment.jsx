import { useState, useEffect } from 'react';
import { api } from '../api';

const OPTION_LABELS = ['Never', 'Sometimes', 'Often', 'Always'];
const OPTION_COLORS = [
  'var(--accent-green)',
  'var(--accent-cyan)',
  'var(--accent-amber)',
  'var(--accent-rose)',
];

const RISK_STYLE = {
  'Healthy': { color: 'var(--accent-green)', icon: '🌟', bg: 'rgba(16,185,129,0.08)' },
  'Mild':    { color: 'var(--accent-cyan)',  icon: '💙', bg: 'rgba(6,182,212,0.08)' },
  'Medium':  { color: 'var(--accent-amber)', icon: '⚡', bg: 'rgba(245,158,11,0.08)' },
  'High':    { color: 'var(--accent-rose)',  icon: '🚨', bg: 'rgba(244,63,94,0.08)' },
};

const DIM_ICONS = {
  Depression: '😔', Anxiety: '😰', Cognitive: '🧠',
  Physical: '💤', Social: '👥', Academic: '📚'
};

export default function Assessment() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getQuestions().then(data => {
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(-1));
      setLoading(false);
    }).catch(e => { setError(e.message); setLoading(false); });
  }, []);

  function selectAnswer(idx) {
    const next = [...answers];
    next[currentQ] = idx;
    setAnswers(next);
  }

  function goNext() {
    if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
  }
  function goPrev() {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const data = await api.submitAssessment(answers);
      setReport(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetAssessment() {
    setAnswers(new Array(questions.length).fill(-1));
    setCurrentQ(0);
    setReport(null);
  }

  if (loading) return <div className="glass-card text-center" style={{ marginTop: 16, padding: 40 }}>⏳ Loading questions...</div>;
  if (error && !report) return <div className="glass-card" style={{ marginTop: 16, color: 'var(--accent-rose)' }}>{error}</div>;

  // ─── Report View ───
  if (report) {
    const risk = RISK_STYLE[report.overall_risk] || RISK_STYLE['Mild'];
    return (
      <div style={{ marginTop: 16 }}>
        {/* Overall Score Card */}
        <div className="glass-card animate-in" style={{ background: risk.bg, borderColor: risk.color.replace('var(', '').replace(')', ''), marginBottom: 16 }}>
          <div className="flex items-center gap-md" style={{ marginBottom: 12 }}>
            <span style={{ fontSize: '3rem' }}>{risk.icon}</span>
            <div>
              <h2 style={{ color: risk.color, marginBottom: 4 }}>{report.overall_risk} Risk</h2>
              <div className="flex gap-sm">
                <span className="badge" style={{
                  background: `${risk.color}20`,
                  color: risk.color,
                  border: `1px solid ${risk.color}40`
                }}>Score: {report.composite_score}</span>
                <span className="badge" style={{
                  background: 'var(--bg-glass)',
                  color: 'var(--text-secondary)',
                  border: 'var(--border-glass)'
                }}>Q: {report.questionnaire_score} + P: {report.passive_penalty}</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            {report.overall_summary}
          </p>
        </div>

        {/* Dimension Breakdown */}
        <div className="glass-card animate-in animate-in-delay-1" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 16 }}>📊 Dimension Breakdown</h3>
          <div className="flex flex-col gap-md">
            {report.dimensions.map((dim, i) => {
              const sevColor = dim.severity === 'Severe' ? 'var(--accent-rose)' :
                               dim.severity === 'Moderate' ? 'var(--accent-amber)' : 'var(--accent-green)';
              return (
                <div key={i} style={{
                  padding: '14px 16px',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-md)',
                  border: 'var(--border-glass)',
                }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {DIM_ICONS[dim.name] || '📋'} {dim.name}
                    </span>
                    <span className="badge" style={{
                      background: `${sevColor}18`,
                      color: sevColor,
                      border: `1px solid ${sevColor}30`
                    }}>{dim.severity}</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{
                    width: '100%', height: 6, background: 'rgba(255,255,255,0.06)',
                    borderRadius: 3, overflow: 'hidden', marginBottom: 8
                  }}>
                    <div style={{
                      width: `${dim.percentage}%`, height: '100%',
                      background: sevColor,
                      borderRadius: 3,
                      transition: 'width 1s ease'
                    }} />
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {dim.recommendation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Passive Data Insights */}
        <div className="glass-card animate-in animate-in-delay-2" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12 }}>🌙 Lifestyle Data Insights</h3>
          <div className="flex flex-col gap-sm">
            {report.passive_data.insights.map((insight, i) => (
              <div key={i} style={{
                padding: '10px 14px',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                color: 'var(--text-secondary)'
              }}>
                {insight}
              </div>
            ))}
          </div>
        </div>

        {/* Retake */}
        <button className="btn btn-outline btn-block animate-in animate-in-delay-3" onClick={resetAssessment}>
          🔄 Retake Assessment
        </button>
      </div>
    );
  }

  // ─── Questionnaire Flow ───
  const allAnswered = answers.every(a => a >= 0);
  const answeredCount = answers.filter(a => a >= 0).length;
  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <div style={{ marginTop: 16 }}>
      {/* Progress */}
      <div className="glass-card animate-in" style={{ padding: '14px 20px', marginBottom: 16 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
          <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
            Question {currentQ + 1} of {questions.length}
          </span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
            {answeredCount}/{questions.length} answered
          </span>
        </div>
        <div style={{
          width: '100%', height: 4, background: 'rgba(255,255,255,0.06)',
          borderRadius: 2, overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: 'var(--gradient-primary)',
            borderRadius: 2,
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card animate-in animate-in-delay-1">
        <div style={{ marginBottom: 6 }}>
          <span className="badge" style={{
            background: 'rgba(139,92,246,0.12)',
            color: 'var(--accent-purple-light)',
            border: '1px solid rgba(139,92,246,0.2)',
            fontSize: '0.7rem'
          }}>{q.dimension}</span>
        </div>
        <h3 style={{ marginBottom: 20, lineHeight: 1.5, fontSize: '1.05rem' }}>{q.text}</h3>

        {/* Answer options */}
        <div className="flex flex-col gap-sm" style={{ marginBottom: 20 }}>
          {OPTION_LABELS.map((label, idx) => {
            const isSelected = answers[currentQ] === idx;
            return (
              <button
                key={idx}
                onClick={() => selectAnswer(idx)}
                style={{
                  padding: '14px 18px',
                  background: isSelected ? `${OPTION_COLORS[idx]}15` : 'var(--bg-glass)',
                  border: isSelected ? `2px solid ${OPTION_COLORS[idx]}` : 'var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: isSelected ? OPTION_COLORS[idx] : 'var(--text-secondary)',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.9rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: isSelected ? `2px solid ${OPTION_COLORS[idx]}` : '2px solid rgba(255,255,255,0.15)',
                  background: isSelected ? OPTION_COLORS[idx] : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', color: isSelected ? 'white' : 'transparent',
                  flexShrink: 0, transition: 'all 0.2s ease'
                }}>✓</span>
                {label}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-sm">
          <button
            className="btn btn-outline"
            onClick={goPrev}
            disabled={currentQ === 0}
            style={{ flex: 1 }}
          >
            ← Back
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={goNext}
              disabled={answers[currentQ] < 0}
              style={{ flex: 1 }}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              style={{ flex: 1 }}
            >
              {submitting ? '⏳ Analyzing...' : '🧠 Get Analysis'}
            </button>
          )}
        </div>
      </div>

      {/* Quick nav dots */}
      <div className="flex justify-center gap-sm" style={{ marginTop: 16 }}>
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            style={{
              width: 10, height: 10, borderRadius: '50%',
              border: 'none', cursor: 'pointer',
              background: i === currentQ ? 'var(--accent-purple)' :
                          answers[i] >= 0 ? 'var(--accent-green)' :
                          'rgba(255,255,255,0.15)',
              transition: 'all 0.2s ease',
              transform: i === currentQ ? 'scale(1.3)' : 'scale(1)'
            }}
          />
        ))}
      </div>
    </div>
  );
}
