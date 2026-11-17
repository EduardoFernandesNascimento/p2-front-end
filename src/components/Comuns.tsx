import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Selo as TipoSelo, StatusPedido } from '../types';

export function RotaProtegida() {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return <p className="estado" role="status">{texto}</p>;
}

export function Erro({ mensagem, onTentar }: { mensagem: string; onTentar?: () => void }) {
  return (
    <div className="estado estado-erro" role="alert">
      <p>{mensagem}</p>
      {onTentar && <button type="button" className="btn" onClick={onTentar}>Tentar de novo</button>}
    </div>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return <p className="estado estado-vazio">{texto}</p>;
}

export function Selo({ selo }: { selo: TipoSelo }) {
  const classe = selo === 'VIP' ? 'selo-vip' : selo === 'Regular' ? 'selo-regular' : 'selo-sem';
  return <span className={`selo ${classe}`}>{selo}</span>;
}

export function StatusTag({ status }: { status: StatusPedido }) {
  return <span className={`status status-${status}`}>{status}</span>;
}
