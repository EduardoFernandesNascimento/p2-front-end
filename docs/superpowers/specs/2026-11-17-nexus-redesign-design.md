# NEXUS Redesign — Especificação de Design

- **Data:** 2026-11-17
- **Projeto:** P2 · CRM de Clientes (Vite + React 18 + TypeScript strict)
- **Escopo:** Redesign visual completo usando `NEXUS_CRM_Kit_Referencia` como direção, com melhorias funcionais/UX aprovadas.
- **Status:** Aprovado pelo usuário (17/11/2026).

## 1. Contexto e objetivo

O app já implementa todas as regras funcionais da prova P2 (login, clientes, pedidos, histórico, painel, erros HTTP, responsividade). O design atual é claro e genérico (cards brancos, azul corporate), sem identidade visual.

Objetivo: aplicar a direção visual futurista escura do kit de referência (TRON-like: fundo escuro, ciano/azul elétrico, tipografia Space Grotesk + Inter, glow controlado, grade digital) **sem alterar a lógica de negócio**, e fechar lacunas da prova/UX.

## 2. Decisões aprovadas (tradeoffs)

| Decisão | Escolha | Motivo |
|---|---|---|
| Direção visual | Tema escuro NEXUS completo | Identidade forte, hierarquia e feedback; paleta do kit já validada para contraste |
| Navegação | Sidebar fixa (desktop) + drawer (mobile) | Referência usa sidebar 248px; drawer com overlay em <700px |
| Abordagem técnica | Retematizar classes CSS existentes + rebuild de `Layout` | Menor risco de regressão; lógica intacta; classes atuais são semânticas |
| Escopo de melhorias | Completo: senha visível, skeleton, toast, modal de confirmação, empty state, foco, reduced-motion, .env.example, index.html | Fecha requisitos da seção 5.1 do kit e eleva qualidade percebida |
| Testes automatizados | Fora do escopo desta entrega | Não aprovado; anotado como próximo passo opcional |

## 3. Não-objetivos (fora do escopo)

- Não alterar contratos da API, regras de negócio nem estrutura de dados.
- Não adicionar rotas novas nem mudar nomes de rotas.
- Não introduzir dependências novas (exceto fontes via Google Fonts `<link>`).
- Não criar dados fictícios: gráficos/indicadores extras no Painel usam **somente dados reais da API**.
- Não converter `window.confirm` em fluxos que mudem a semântica; apenas estilizar o diálogo.

## 4. Arquitetura de mudança

### 4.1 Tokens e globais (`src/index.css`)

- Novas variáveis (da referência): `--bg #050b14`, `--surface #0b1624`, `--surface-raised #101f30`, `--cyan #00d9ff`, `--blue #168bff`, `--violet #8b5cf6`, `--text #eaf7ff`, `--muted #8ba8bc`, `--success #22d3a6`, `--warning #f5b942`, `--danger #ff5572`, `--border rgba(88,190,220,.22)`, `--radius 16px`.
- Mapeamento das variáveis atuais para as novas (ex.: `--fundo → --bg`, `--cartao → --surface`, `--primaria → --cyan`, `--perigo → --danger`, `--ok → --success`, `--aviso → --warning`).
- Fundo: gradientes radiais + `.grid-overlay` e `.ambient` fixos (pointer-events: none).
- Tipografia: Space Grotesk (títulos/valores) + Inter (corpo); `font-variant-numeric: tabular-nums` em números.
- `:focus-visible` ciano; `prefers-reduced-motion` desliga animações.
- Estilos base: `body`, `button/input/select/textarea` herdam fonte; superfícies escuras.

### 4.2 Layout (`src/components/Layout.tsx`)

- Estrutura: `app-shell` (flex) → `sidebar` + `main-content`.
- Sidebar (desktop): `brand` (marca geométrica NEXUS), `side-label`, `nav-list` (Painel, Clientes, Pedidos, Novo cliente — NavLink com classe `active`), `sidebar-bottom`: estado do sistema, `user-mini` (avatar com iniciais + nome vindo de `/auth/me`), `logout`.
- Mobile (<700px): sidebar vira drawer (`translateX(-105%) ↔ 0`), overlay `.mobile-scrim`, botão `.menu-toggle` na topbar; fecha com Escape, clique no overlay e ao navegar.
- Topbar interna: breadcrumb/título da página (via `useLocation` simplificado ou título por rota), perfil compacto, toggle mobile.
- Manter `Outlet` e `NavLink` atuais (mesma lógica de `useAuth`/`sair`).

### 4.3 Novos componentes de feedback

| Componente | Arquivo | Comportamento |
|---|---|---|
| `Skeleton` | `components/Comuns.tsx` | Blocos shimmer (variantes: cartão/linha/valor), `role="status"` |
| `ToastProvider` + `useToast` | `components/Toast.tsx` (novo) | Contexto; pilha bottom-right; tipos success/error/info; auto-dismiss ~3,5s; `aria-live="polite"`; fade/slide 180ms |
| `ModalConfirm` | `components/ModalConfirm.tsx` (novo) | Substituto estilizado de `window.confirm` (glass, blur, borda luminosa, scale+fade 180–220ms, Escape cancela, overlay fecha, autofocus no confirmar) |
| `EmptyState` | `components/Comuns.tsx` | Ícone + título + texto + ação opcional |
- `Carregando` passa a usar `Skeleton`; `Vazio` passa a usar `EmptyState`; `Erro` mantém estrutura com botão "Tentar de novo".

### 4.4 Pontos de integração do ModalConfirm

Substituir `window.confirm` em (sem mudar condição de negócio):
1. `ClienteDetalhe` — excluir cliente (exibe contagem de pedidos/atendimentos).
2. `PedidosCliente` — cancelar pedido (aviso "não muda mais") e excluir pedido.
3. `HistoricoCliente` — excluir atendimento.

### 4.5 Telas

- **Login** (`pages/Login.tsx`): adicionar toggle **mostrar/ocultar senha** (botão de ícone dentro do campo, `aria-label` dinâmico, `type=password/text`); card escuro com marca; manter lógica de redirect e erros.
- **Painel** (`pages/Painel.tsx`): KPI cards (ícone, valor, label, nota) para Total de clientes, Total vendido, Ticket médio; painel "Pedidos por status" com barras de progresso proporcionais + `StatusTag`; Top 3 com medalhas (01/02/03), avatar de iniciais, valor e barra proporcional ao líder. Somente dados reais.
- **Clientes**: cards com avatar de iniciais, nome, selo, e-mail, empresa/cidade; paginação e skeleton.
- **ClienteDetalhe**: painel de dados com selo e ações; seções existentes reestilizadas.
- **ClienteForm / ItensEditor / PedidosCliente / HistoricoCliente**: campos escuros, erros próximos aos campos, botões por token.
- **Pedidos**: barra de filtros em card, linhas com status pill.

### 4.6 `index.html` e `.env.example`

- `index.html`: meta `theme-color` `#050b14`; preconnect + `<link>` Google Fonts (Inter + Space Grotesk, `display=swap`); título "NEXUS CRM".
- Criar `.env.example` com `VITE_API_URL=http://localhost:3333` (não versionar segredos; URL local não é segredo).

### 4.7 Acessibilidade e movimento

- Alvos de toque ≥44px; foco visível; contraste AA nas combinações usadas.
- Durações conforme kit: entrada de página 160–220ms, hover de card 150–200ms, modal 180–220ms, drawer 220–280ms, toast 180ms.
- `prefers-reduced-motion`: remover deslocamentos/contadores/desenho; manter fade mínimo ou transições instantâneas.

## 5. Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/index.css` | Reescrever com tokens/tema escuro + estilos novos (mantendo nomes de classe existentes) |
| `src/components/Layout.tsx` | Reescrever: sidebar + drawer + topbar |
| `src/components/Comuns.tsx` | Adicionar `Skeleton`, `EmptyState`; atualizar `Carregando`/`Vazio` |
| `src/components/Toast.tsx` | Novo (ToastProvider/useToast) |
| `src/components/ModalConfirm.tsx` | Novo |
| `src/pages/Login.tsx` | Ajuste: toggle de senha + classes |
| `src/pages/Painel.tsx` | Reestilizar KPI + status + Top 3 |
| `src/pages/Clientes.tsx`, `ClienteDetalhe.tsx`, `ClienteForm.tsx`, `Pedidos.tsx`, `NaoEncontrada.tsx` | Ajustes de classes (mínimos) |
| `src/components/PedidosCliente.tsx`, `HistoricoCliente.tsx`, `ItensEditor.tsx` | ModalConfirm + classes |
| `index.html` | Meta/fonts/título |
| `.env.example` | Novo |
| `README.md` | Atualizar estrutura e nota de design (após implementação) |

## 6. Verificação

1. `npm install` (node_modules ausente no repo).
2. `npm run build` sem erros (tsc -b && vite build).
3. Teste manual de fluxo (login → painel → clientes → detalhe → pedidos → histórico → 404) em 375px / 768px / desktop.
4. Conferir estados loading/empty/error/success e feedback de toast.
5. Conferir `prefers-reduced-motion` e foco por teclado.

## 7. Risco e mitigação

- **Risco principal:** regressão visual por troca massiva de CSS → mitigação: manter nomes de classe, validar build + teste manual por fluxo.
- **Fontes externas:** Google Fonts pode falhar offline → fallback `system-ui, sans-serif` já definido.
- **Contraste:** verificar pares ciano/texto sobre escuro; usar `#EAF7FF`/`#8BA8BC` para texto sobre superfícies.
