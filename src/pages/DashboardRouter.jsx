import ClientDashboard from './ClientDashboard.jsx';
import EngineerDashboard from './EngineerDashboard.jsx';

export default function DashboardRouter({ appContext }) {
  const { session } = appContext;
  if (session.status === 'loading') return <div className="loading">Cargando portal...</div>;
  if (!session.authenticated) {
    window.location.href = '/login';
    return <div className="loading">Redirigiendo...</div>;
  }
  if (!session.allowed) return <div className="loading"><h1>Acceso no autorizado</h1><p>Tu cuenta no esta habilitada para este portal.</p><a href="/logout">Salir</a></div>;
  if (session.role === 'engineer' || session.role === 'admin') return <EngineerDashboard appContext={appContext} />;
  return <ClientDashboard appContext={appContext} />;
}
