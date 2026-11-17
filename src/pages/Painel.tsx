import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Carregando, Erro, StatusTag, Vazio } from '../components/Comuns';
import { clientesApi, mensagemErro, pedidosApi } from '../services/api';
import type { Cliente, Pedido } from '../types';
import { moeda, resumoPorStatus, ticketMedio, topClientes, totalVendido } from '../utils/calculos';

export function Painel() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const [lista, todos] = await Promise.all([clientesApi.listar({ limit: 100 }), pedidosApi.todos()]);
      setClientes(lista.clientes);
      setTotalClientes(lista.total);
      setPedidos(todos);
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  if (loading) return <Carregando />;
  if (erro) return <Erro mensagem={erro} onTentar={carregar} />;

  const top3 = topClientes(clientes, pedidos);

  return (
    <section>
      <div className="cabecalho">
        <h1>Painel</h1>
        <Link to="/clientes/novo" className="btn btn-primario">+ Novo cliente</Link>
      </div>

      <div className="grade-numeros">
        <div className="cartao numero"><span>Total de clientes</span><strong>{totalClientes}</strong></div>
        <div className="cartao numero"><span>Total vendido</span><strong>{moeda(totalVendido(pedidos))}</strong><small>sem cancelados</small></div>
        <div className="cartao numero"><span>Ticket médio</span><strong>{moeda(ticketMedio(pedidos))}</strong><small>sem cancelados</small></div>
      </div>

      <div className="grade-duas">
        <div className="cartao">
          <h2>Pedidos por status</h2>
          <table className="tabela">
            <thead><tr><th>Status</th><th>Qtd.</th><th>Valor</th></tr></thead>
            <tbody>
              {resumoPorStatus(pedidos).map((r) => (
                <tr key={r.status}><td><StatusTag status={r.status} /></td><td>{r.quantidade}</td><td>{moeda(r.valor)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cartao">
          <h2>Top 3 clientes</h2>
          {top3.length === 0 ? (
            <Vazio texto="Nenhuma compra registrada ainda." />
          ) : (
            <ol className="ranking">
              {top3.map((r) => (
                <li key={String(r.cliente.id)}>
                  <Link to={`/clientes/${r.cliente.id}`}>{r.cliente.nome}</Link>
                  <strong>{moeda(r.total)}</strong>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
