import { useEffect, useMemo, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardRouter from './pages/DashboardRouter.jsx';
import { getSession } from './lib/api.js';

export default function App() {
  const [session, setSession] = useState({ status: 'loading', user: null });
  const path = window.location.pathname;

  const refreshSession = async () => {
    try {
      const data = await getSession();
      setSession({ status: 'ready', ...data });
    } catch {
      setSession({ status: 'ready', authenticated: false, user: null, role: 'anonymous' });
    }
  };

  useEffect(() => { refreshSession(); }, []);

  const appContext = useMemo(() => ({ session, refreshSession }), [session]);

  if (path.startsWith('/dashboard')) return <DashboardRouter appContext={appContext} />;
  if (path === '/login') return <LoginPage session={session} />;
  return <LandingPage session={session} />;
}
