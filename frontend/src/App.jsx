import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { getToken } from './api';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if a token already exists (returning user)
    const token = getToken();
    if (token) {
      setUser({ token });
    }
  }, []);

  function handleLogin(data) {
    setUser(data);
  }

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
