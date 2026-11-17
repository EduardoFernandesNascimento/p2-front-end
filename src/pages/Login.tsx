import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError, mensagemErro } from '../services/api';

export function Login() {
  const { token, entrar, avisoSessao } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from;
  const destino = from ? `${from.pathname}${from.search}` : '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to={destino} replace />;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErro('Informe usuário e senha.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      await entrar(username.trim(), password);
      navigate(destino, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 401)) setErro('Usuário ou senha inválidos.');
      else setErro(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-pagina">
      <form className="cartao login-form" onSubmit={enviar} noValidate>
        <div className="login-marca">
          <span className="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
          <span className="brand-name">NEXUS<small>CRM / DIGITAL GRID</small></span>
        </div>
        <h1>Acesso ao CRM</h1>
        <p className="sub">Entre para gerenciar clientes, pedidos e atendimentos.</p>
        {avisoSessao && !erro && <p className="alerta" role="alert">{avisoSessao}</p>}
        {erro && <p className="alerta alerta-erro" role="alert">{erro}</p>}
        <label>
          Usuário
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
        </label>
        <label>
          Senha
          <span className="campo-senha">
            <input
              type={verSenha ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-senha"
              aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setVerSenha((v) => !v)}
            >
              {verSenha ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </span>
        </label>
        <button type="submit" className="btn btn-primario" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
