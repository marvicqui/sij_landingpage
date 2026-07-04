export default function TopNav({ session }) {
  const dashboardHref = session?.role === 'engineer' || session?.role === 'admin' ? '/dashboard/ingeniero' : '/dashboard/cliente';
  return (
    <header className="top-nav">
      <a className="brand" href="/">
        <img src="/assets/sij-mark.svg" alt="SIJ" />
        <span>SIJ</span>
      </a>
      <nav>
        <a href="/#soluciones">Soluciones</a>
        <a href="/#soporte">Soporte</a>
        <a href="/#contacto">Contacto</a>
        {session?.authenticated ? <a className="nav-action" href={dashboardHref}>Portal</a> : <a className="nav-action" href="/login">Ingresar</a>}
      </nav>
    </header>
  );
}
