import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { nomeUsuario, useAuth } from '../context/AuthContext';
import { iniciais } from '../utils/calculos';

const TITULOS: Record<string, string> = {
  '/': 'Painel',
  '/clientes': 'Clientes',
  '/clientes/novo': 'Novo cliente',
  '/pedidos': 'Pedidos',
};

const tituloDaRota = (pathname: string): string => {
  const exato = TITULOS[pathname];
  if (exato) return exato;
  const m = /^\/clientes\/([^/]+)(\/editar)?$/.exec(pathname);
  if (m) return m[2] ? 'Editar cliente' : 'Detalhe do cliente';
  return 'NEXUS CRM';
};

export function Layout() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [aberto, setAberto] = useState(false);

  const fechar = () => setAberto(false);

  const fazerSair = () => {
    sair();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto]);

  useEffect(() => { fechar(); }, [location.pathname]);

  const nome = nomeUsuario(usuario) || 'Atendente';
  const iniciaisUsuario = iniciais(nome);

  const classeNav = ({ isActive }: { isActive: boolean }) => `nav-item${isActive ? ' active' : ''}`;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${aberto ? 'is-open' : ''}`} id="sidebar" aria-label="Menu lateral">
        <span className="brand">
          <span className="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
          <span className="brand-name">NEXUS<small>CRM / DIGITAL GRID</small></span>
        </span>

        <div className="side-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Menu principal">
          <NavLink to="/" end className={classeNav} onClick={fechar}>
            <span className="nav-icon" aria-hidden="true">⌂</span><span>Painel</span>
          </NavLink>
          <NavLink to="/clientes" end className={classeNav} onClick={fechar}>
            <span className="nav-icon" aria-hidden="true">◎</span><span>Clientes</span>
          </NavLink>
          <NavLink to="/pedidos" className={classeNav} onClick={fechar}>
            <span className="nav-icon" aria-hidden="true">▤</span><span>Pedidos</span>
          </NavLink>
          <NavLink to="/clientes/novo" className={classeNav} onClick={fechar}>
            <span className="nav-icon" aria-hidden="true">＋</span><span>Novo cliente</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="system-state">
            <span className="live-dot" aria-hidden="true" />
            <span>AMBIENTE CONECTADO</span>
          </div>
          <div className="user-mini">
            <div className="avatar" aria-hidden="true">{iniciaisUsuario}</div>
            <div>
              <strong>{nome}</strong>
              <small>Atendente</small>
            </div>
          </div>
          <button type="button" className="nav-item logout" onClick={fazerSair}>
            <span className="nav-icon" aria-hidden="true">↗</span><span>Sair</span>
          </button>
        </div>
      </aside>

      {aberto && <div className="mobile-scrim" onClick={fechar} aria-hidden="true" />}

      <main className="main-content">
        <header className="topbar">
          <button
            type="button"
            className="menu-toggle"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={aberto}
            aria-controls="sidebar"
            onClick={() => setAberto((v) => !v)}
          >
            ☰
          </button>
          <div className="breadcrumb">
            <span>WORKSPACE</span>
            <b>/</b>
            <strong>{tituloDaRota(location.pathname)}</strong>
          </div>
          <div className="top-user">
            <div className="avatar" aria-hidden="true">{iniciaisUsuario}</div>
            <div>
              <strong>{nome}</strong>
              <small>Atendente</small>
            </div>
          </div>
        </header>

        <div className="pagina-entrada">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
