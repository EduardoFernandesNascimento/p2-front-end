import { useState } from 'react';
import { mensagemErro, pedidosApi } from '../services/api';
import type { Id, ItemPedido, Pedido, StatusPedido } from '../types';
import { dataDe, formatarData, moeda, ordenarRecentes, podeEditarItens, proximosStatus, totalPedido } from '../utils/calculos';
import { paraRascunho } from '../utils/validacao';
import { StatusTag, Vazio } from './Comuns';
import { ItensEditor } from './ItensEditor';

interface Props {
  clienteId: Id;
  pedidos: Pedido[];
  onMudou: () => Promise<void>;
}

const ROTULO_STATUS: Record<StatusPedido, string> = { aberto: 'Reabrir', pago: 'Marcar como pago', cancelado: 'Cancelar pedido' };

export function PedidosCliente({ clienteId, pedidos, onMudou }: Props) {
  const [criando, setCriando] = useState(false);
  const [editandoId, setEditandoId] = useState<Id | null>(null);
  const [ocupadoId, setOcupadoId] = useState<Id | null>(null);
  const [erro, setErro] = useState('');

  const criar = async (itens: ItemPedido[]) => {
    try {
      await pedidosApi.criar(clienteId, itens);
      setCriando(false);
      await onMudou();
    } catch (err) {
      throw new Error(mensagemErro(err, { recurso: 'Cliente' }));
    }
  };

  const salvarItens = (id: Id) => async (itens: ItemPedido[]) => {
    try {
      await pedidosApi.editarItens(id, itens);
      setEditandoId(null);
      await onMudou();
    } catch (err) {
      throw new Error(mensagemErro(err, { recurso: 'Pedido' }));
    }
  };

  const mudarStatus = async (pedido: Pedido, status: StatusPedido) => {
    if (status === 'cancelado' && !window.confirm(`Cancelar o pedido #${pedido.id}? Pedido cancelado não muda mais.`)) return;
    setOcupadoId(pedido.id);
    setErro('');
    try {
      await pedidosApi.mudarStatus(pedido.id, status);
      await onMudou();
    } catch (err) {
      setErro(mensagemErro(err, { recurso: 'Pedido' }));
    } finally {
      setOcupadoId(null);
    }
  };

  const excluir = async (pedido: Pedido) => {
    if (!window.confirm(`Excluir o pedido #${pedido.id} (${moeda(totalPedido(pedido))})? Esta ação não pode ser desfeita.`)) return;
    setOcupadoId(pedido.id);
    setErro('');
    try {
      await pedidosApi.excluir(pedido.id);
      await onMudou();
    } catch (err) {
      setErro(mensagemErro(err, { recurso: 'Pedido' }));
    } finally {
      setOcupadoId(null);
    }
  };

  const lista = ordenarRecentes(pedidos);

  return (
    <div className="cartao secao">
      <div className="cabecalho">
        <h2>Pedidos ({pedidos.length})</h2>
        {!criando && <button type="button" className="btn btn-primario" onClick={() => setCriando(true)}>+ Novo pedido</button>}
      </div>
      {erro && <p className="alerta alerta-erro" role="alert">{erro}</p>}
      {criando && (
        <div className="bloco-form">
          <h3>Novo pedido</h3>
          <ItensEditor rotuloSalvar="Criar pedido" onSalvar={criar} onCancelar={() => setCriando(false)} />
        </div>
      )}

      {lista.length === 0 ? (
        <Vazio texto="Este cliente ainda não tem pedidos." />
      ) : (
        <ul className="lista-pedidos">
          {lista.map((p) => {
            const ocupado = ocupadoId !== null && String(ocupadoId) === String(p.id);
            const editando = editandoId !== null && String(editandoId) === String(p.id);
            return (
              <li key={String(p.id)} className="pedido">
                <div className="linha-titulo">
                  <strong>Pedido #{p.id}</strong>
                  <StatusTag status={p.status} />
                </div>
                <div className="texto-suave">{formatarData(dataDe(p))}</div>
                {editando ? (
                  <ItensEditor
                    inicial={paraRascunho(p.itens)}
                    rotuloSalvar="Salvar itens"
                    onSalvar={salvarItens(p.id)}
                    onCancelar={() => setEditandoId(null)}
                  />
                ) : (
                  <>
                    <ul className="itens">
                      {p.itens.map((it, i) => (
                        <li key={i}>{it.quantidade} × {it.titulo} — {moeda(Number(it.preco))}</li>
                      ))}
                    </ul>
                    <div className="total-pedido">Total: <strong>{moeda(totalPedido(p))}</strong></div>
                    <div className="acoes">
                      {podeEditarItens(p) && (
                        <button type="button" className="btn btn-pequeno" disabled={ocupado} onClick={() => setEditandoId(p.id)}>Editar itens</button>
                      )}
                      {proximosStatus(p.status).map((s) => (
                        <button key={s} type="button" className={`btn btn-pequeno ${s === 'cancelado' ? 'btn-perigo' : ''}`} disabled={ocupado} onClick={() => mudarStatus(p, s)}>
                          {ROTULO_STATUS[s]}
                        </button>
                      ))}
                      <button type="button" className="btn btn-pequeno btn-perigo" disabled={ocupado} onClick={() => excluir(p)}>Excluir</button>
                    </div>
                    {p.status !== 'aberto' && <p className="texto-suave">Pedido {p.status}: itens só para leitura.</p>}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
