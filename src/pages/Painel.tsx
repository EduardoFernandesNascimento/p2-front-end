import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Carregando, Erro, EmptyState, StatusTag } from '../components/Comuns';
import { clientesApi, mensagemErro, pedidosApi } from '../services/api';
import type { Cliente, Pedido } from '../types';
import { iniciais, moeda, resumoPorStatus, ticketMedio, topClientes, totalVendido } from '../utils/calculos';

const RANKS = ['one', 'two', 'three'] as const;

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

  if (loading) return <Carregando variante="valor" />;
  if (erro) return <Erro mensagem={erro} onTentar={carregar} />;

  const top3 = topClientes(clientes, pedidos);
  const maiorTotal = top3.length > 0 ? top3[0].total : 0;
  const resumo = resumoPorStatus(pedidos);
  const maxQuantidade = Math.max(1, ...resumo.map((r) => r.quantidade));

  return (
    <section>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" aria-hidden="true" />
            <span>CENTRAL DE COMANDO</span>
            <span className="eyebrow-line" aria-hidden="true" />
          </div>
          <h1>Painel <span>geral</span></h1>
          <p>Visão geral da operação. Tudo conectado em um só lugar.</p>
        </div>
        <Link to="/clientes/novo" className="primary-button">
          <span aria-hidden="true">＋</span> Novo cliente
        </Link>
      </div>

      <div className="metrics-grid" aria-label="Indicadores">
        <article className="metric-card">
          <div className="metric-top"><span className="metric-icon cyan" aria-hidden="true">◎</span></div>
          <div className="metric-value">{totalClientes}</div>
          <div className="metric-label">Total de clientes</div>
          <div className="metric-foot"><span>BASE DE CLIENTES</span><span>Todos os cadastros</span></div>
        </article>
        <article className="metric-card">
          <div className="metric-top"><span className="metric-icon blue" aria-hidden="true">＄</span></div>
          <div className="metric-value">{moeda(totalVendido(pedidos))}</div>
          <div className="metric-label">Total vendido</div>
          <div className="metric-foot"><span>VENDAS VÁLIDAS</span><span>Sem cancelados</span></div>
        </article>
        <article className="metric-card">
          <div className="metric-top"><span className="metric-icon violet" aria-hidden="true">▥</span></div>
          <div className="metric-value">{moeda(ticketMedio(pedidos))}</div>
          <div className="metric-label">Ticket médio</div>
          <div className="metric-foot"><span>VALOR POR PEDIDO</span><span>Sem cancelados</span></div>
        </article>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">STATUS</div>
              <h2>Pedidos por status</h2>
            </div>
          </div>
          {resumo.map((r) => (
            <div className="status-linha" key={r.status}>
              <div className="status-linha-topo">
                <StatusTag status={r.status} />
                <span className="texto-suave">{r.quantidade} pedido{r.quantidade === 1 ? '' : 's'}</span>
              </div>
              <div className="progress" aria-hidden="true">
                <i style={{ width: `${(r.quantidade / maxQuantidade) * 100}%` }} />
              </div>
              <div className="metric-foot"><span>VALOR</span><span className="status-valor">{moeda(r.valor)}</span></div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">RELACIONAMENTO</div>
              <h2>Top clientes</h2>
            </div>
            <span className="trophy" aria-hidden="true">♜</span>
          </div>
          {top3.length === 0 ? (
            <EmptyState icone="♜" titulo="Nenhuma compra registrada ainda." texto="Quando houver pedidos válidos, o ranking aparecerá aqui." />
          ) : (
            top3.map((r, i) => (
              <Link to={`/clientes/${r.cliente.id}`} className="client-rank" key={String(r.cliente.id)}>
                <span className={`rank rank-${RANKS[i]}`} aria-label={`Posição ${i + 1}`}>0{i + 1}</span>
                <span className="avatar" aria-hidden="true">{iniciais(r.cliente.nome)}</span>
                <span className="client-info">
                  <strong className="quebra">{r.cliente.nome}</strong>
                  <small>Total comprado</small>
                  <span className="progress" aria-hidden="true">
                    <i style={{ width: `${maiorTotal > 0 ? (r.total / maiorTotal) * 100 : 0}%` }} />
                  </span>
                </span>
                <b>{moeda(r.total)}</b>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
