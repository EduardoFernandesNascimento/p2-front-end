import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { nomeUsuario, useAuth } from '../context/AuthContext';

export function Layout() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);

  const fazerSair = () => {
    sair();
    navigate('/login', { replace: true });
  };

  const fechar = () => setAberto(false);

  return (
    <div className="app">
      <header className="topo">
        <div className="topo-linha">
          <NavLink to="/" className="marca" onClick={fechar}>CRM</NavLink>
          <button type="button" className="btn-menu" aria-expanded={aberto} aria-controls="menu-principal" onClick={() => setAberto((v) => !v)}>
            {aberto ? 'Fechar' : 'Menu'}
          </button>
        </div>
        <nav id="menu-principal" className={`menu ${aberto ? 'menu-aberto' : ''}`} aria-label="Menu principal">
          <NavLink to="/" end onClick={fechar}>Painel</NavLink>
          <NavLink to="/clientes" end onClick={fechar}>Clientes</NavLink>
          <NavLink to="/pedidos" onClick={fechar}>Pedidos</NavLink>
          <NavLink to="/clientes/novo" onClick={fechar}>Novo cliente</NavLink>
          <span className="menu-usuario" title="Usuário logado">{nomeUsuario(usuario) || '...'}</span>
          <button type="button" className="btn btn-sair" onClick={fazerSair}>Sair</button>
        </nav>
      </header>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
