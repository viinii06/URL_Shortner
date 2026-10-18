import { useState } from 'react';
import Login from './pages/Login.jsx';
import Links from './pages/Links.jsx';

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('session'));
    } catch {
      return null;
    }
  });

  function handleLogin(data) {
    localStorage.setItem('session', JSON.stringify(data));
    setSession(data);
  }

  function handleLogout() {
    localStorage.removeItem('session');
    setSession(null);
  }

  return (
    <main className="wrap">
      <header className="brand">
        <h1>snip<span>.</span></h1>
        {session && (
          <button className="ghost" onClick={handleLogout}>
            Log out
          </button>
        )}
      </header>
      {session ? (
        <Links session={session} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </main>
  );
}
