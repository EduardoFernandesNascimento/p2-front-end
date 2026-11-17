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
        <h1>CRM de Clientes</h1>
        <p className="sub">Entre para gerenciar clientes, pedidos e atendimentos.</p>
        {avisoSessao && !erro && <p className="alerta" role="alert">{avisoSessao}</p>}
        {erro && <p className="alerta alerta-erro" role="alert">{erro}</p>}
        <label>
          Usuário
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        <button type="submit" className="btn btn-primario" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
