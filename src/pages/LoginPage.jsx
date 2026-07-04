import TopNav from '../components/TopNav.jsx';

export default function LoginPage({ session }) {
  const next = session?.role === 'engineer' || session?.role === 'admin' ? '/dashboard/ingeniero' : '/dashboard/cliente';
  return (
    <>
      <TopNav session={session} />
      <main className="login-screen">
        <section className="login-panel">
          <img src="/assets/sij-mark.svg" alt="SIJ" />
          <h1>Portal SIJ</h1>
          <p>Acceso seguro con Microsoft Entra ID. Solo clientes y personal autorizado pueden consultar el HelpDesk.</p>
          {session?.authenticated ? <a className="primary" href={next}>Continuar al portal</a> : <a className="primary" href="/.auth/login/aad?post_login_redirect_uri=/dashboard">Ingresar con Microsoft</a>}
          <a className="secondary" href="/">Volver al sitio</a>
        </section>
      </main>
    </>
  );
}
