import { useState } from 'react';
import MoodLogger from './MoodLogger';
import DataIngestor from './DataIngestor';
import RiskAlert from './RiskAlert';
import { clearToken } from '../api';

const TABS = [
  { id: 'mood', label: '📋 Check-in' },
  { id: 'data', label: '🌙 Data' },
  { id: 'alert', label: '🔍 Analysis' },
];

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('mood');

  function handleLogout() {
    clearToken();
    if (onLogout) onLogout();
  }

  return (
    <div className="dashboard" style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div className="flex justify-between items-center animate-in" style={{ marginBottom: 20, paddingTop: 8 }}>
        <div>
          <h2><span className="gradient-text">MindSafe</span></h2>
          <p className="text-muted" style={{ fontSize: '0.75rem' }}>
            <span className="status-dot green" style={{ marginRight: 6 }} />
            Secure session active
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          🚪 Exit
        </button>
      </div>

      {/* Quick Stats Bar */}
      <div className="glass-card animate-in animate-in-delay-1" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div className="flex justify-between items-center">
          <div className="text-center" style={{ flex: 1 }}>
            <span style={{ fontSize: '1.5rem' }}>🛡️</span>
            <p className="text-muted" style={{ fontSize: '0.7rem', marginTop: 4 }}>Anonymous</p>
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.06)' }} />
          <div className="text-center" style={{ flex: 1 }}>
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
            <p className="text-muted" style={{ fontSize: '0.7rem', marginTop: 4 }}>Encrypted</p>
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.06)' }} />
          <div className="text-center" style={{ flex: 1 }}>
            <span style={{ fontSize: '1.5rem' }}>💚</span>
            <p className="text-muted" style={{ fontSize: '0.7rem', marginTop: 4 }}>Private</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="nav-tabs animate-in animate-in-delay-2" style={{ marginBottom: 8 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in animate-in-delay-3">
        {activeTab === 'mood' && <MoodLogger />}
        {activeTab === 'data' && <DataIngestor />}
        {activeTab === 'alert' && <RiskAlert />}
      </div>
    </div>
  );
}
