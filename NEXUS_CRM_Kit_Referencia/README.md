# NEXUS CRM — Documentação de Design UI/UX e Referência de Implementação

> **Projeto:** CRM de Clientes — Prova prática P2  
> **Curso:** Engenharia de Software · Laboratório de Programação Front End  
> **Direção visual:** futurismo cinematográfico inspirado na linguagem visual de *TRON*  
> **Versão do documento:** 1.0  
> **Objetivo:** servir como referência visual, funcional e técnica para continuidade do projeto por outra IA ou pessoa desenvolvedora.

---

## 1. Visão do produto

O **NEXUS CRM** é um sistema de gestão de clientes para uma pequena empresa. O usuário autenticado gerencia clientes, pedidos e histórico de atendimentos em uma interface web responsiva.

A identidade visual deve evocar um ambiente digital futurista: superfícies escuras, linhas luminosas, geometria técnica e acentos em ciano/azul elétrico. A referência a *TRON* é estética; não copiar logotipos, personagens, veículos ou elementos protegidos da franquia.

### Direção criativa

- **Personalidade:** tecnológica, precisa, sofisticada, imersiva e confiável.
- **Referência:** cidade digital, circuitos luminosos, energia e interfaces holográficas.
- **Evitar:** aparência de jogo, excesso de neon, animações constantes, texto ilegível e excesso de transparência.
- **Princípio central:** o futurismo deve reforçar a hierarquia e o feedback, nunca competir com a tarefa do usuário.

## 2. Objetivos de UX

1. Permitir que o atendente encontre clientes rapidamente.
2. Exibir informações comerciais com leitura imediata.
3. Facilitar a criação e manutenção de clientes, pedidos e atendimentos.
4. Deixar claro o estado de cada operação e pedido.
5. Manter navegação consistente entre todas as páginas.
6. Funcionar em desktop, tablet e celular a partir de 375 px.
7. Preservar acessibilidade, contraste e previsibilidade.

## 3. Identidade visual

### 3.1 Paleta sugerida

| Token | Cor | Uso |
|---|---|---|
| `--bg` | `#050B14` | Fundo principal |
| `--surface` | `#0B1624` | Cards e painéis |
| `--surface-raised` | `#101F30` | Campos, menus e superfícies elevadas |
| `--cyan` | `#00D9FF` | Ação primária, foco e destaque |
| `--blue` | `#168BFF` | Gráficos e estados informativos |
| `--violet` | `#8B5CF6` | Destaque secundário |
| `--text` | `#EAF7FF` | Texto principal |
| `--muted` | `#8BA8BC` | Texto secundário |
| `--success` | `#22D3A6` | Pago/sucesso |
| `--warning` | `#F5B942` | Aberto/atenção |
| `--danger` | `#FF5572` | Cancelado/erro |
| `--border` | `rgba(88, 190, 220, .22)` | Contornos sutis |

Não usar apenas a cor para comunicar status: combinar cor com texto e, quando adequado, ícone.

### 3.2 Tipografia

- Títulos: **Space Grotesk** ou **Sora**.
- Corpo: **Inter**.
- Fallback: `system-ui`, `sans-serif`.
- Métricas e valores: usar números tabulares (`font-variant-numeric: tabular-nums`).
- Evitar textos longos em caixa alta e fontes futuristas difíceis de ler.

### 3.3 Formas, superfícies e luz

- Cards com raio de 12–18 px.
- Contornos finos em ciano/azul com baixa opacidade.
- Sombras profundas; glow curto e sutil apenas em foco, hover ou seleção.
- Glassmorphism somente em camadas de destaque, preservando contraste.
- Grade digital e gradientes radiais no fundo com opacidade baixa.
- Recortes angulares podem aparecer em componentes especiais, sem comprometer a consistência.

## 4. Layout e navegação

### Desktop

- Sidebar entre 230 e 260 px.
- Área de conteúdo fluida, com largura máxima recomendada de 1440 px.
- Espaçamento lateral entre 24 e 32 px.
- Cabeçalho com título, breadcrumb quando útil e perfil do usuário.
- Menu: Painel, Clientes, Pedidos, Novo cliente e Sair.
- Exibir o nome do usuário autenticado obtido de `GET /auth/me`.

### Mobile

- Breakpoint principal sugerido: 768 px.
- Sidebar vira drawer com overlay ou navegação compacta.
- Ações primárias devem permanecer fáceis de alcançar.
- Tabelas extensas viram cartões ou listas com campos prioritários.
- Não permitir rolagem horizontal em viewport de 375 px.
- Áreas de toque recomendadas: pelo menos 44 × 44 px.

## 5. Telas obrigatórias da prova

### 5.1 Login

- Campos de usuário e senha.
- Mostrar/ocultar senha.
- Estado de carregamento no botão.
- Mensagem amigável quando a autenticação falhar.
- Sucesso leva ao Painel ou à rota protegida que o usuário tentou acessar.
- Única tela acessível sem sessão.

### 5.2 Painel

Apresentar:

- Total de clientes.
- Total vendido, ignorando pedidos cancelados.
- Ticket médio, ignorando pedidos cancelados.
- Pedidos por status: quantidade e valor em aberto, pago e cancelado.
- Top 3 clientes por total comprado, sem pedidos cancelados.
- Atalho “Novo cliente”.

Gráficos devem representar dados reais calculados a partir da API. Conteúdo fictício só pode aparecer em protótipos claramente identificados.

### 5.3 Lista de clientes

- Busca por nome ou e-mail.
- Paginação de 5 em 5 usando `limit` e `skip`.
- Estados de carregamento, vazio e erro.
- Selo de cliente: VIP, Regular ou Sem compras.
- Clique no cliente abre o detalhe.

### 5.4 Detalhe do cliente

- Dados cadastrais e selo.
- Ações Editar e Excluir.
- Exclusão exige confirmação que informe quantos pedidos e atendimentos serão apagados.
- Seção Pedidos.
- Seção Histórico de atendimento.
- Cliente inexistente deve exibir “Cliente não encontrado”.

### 5.5 Formulário de cliente

- Criar e editar.
- Nome obrigatório.
- E-mail obrigatório e válido.
- Pelo menos dois entre telefone (`telefone`), empresa (`empresa`) e cidade (`cidade`).
- Validar no frontend antes de enviar.
- Exibir mensagens próximas aos campos.
- Após salvar, voltar à lista ou ao detalhe conforme o fluxo de origem.

### 5.6 Todos os pedidos

- Listar todos os pedidos e o nome do cliente.
- Buscar nomes dos clientes usando `GET /clientes?limit=100`, conforme orientação da prova.
- Filtro por status.
- Filtro por faixa de valor.
- Ordenar por data ou total.
- Clique leva ao cliente relacionado.

### 5.7 Histórico de atendimento

Dentro do detalhe do cliente:

- Ordenar do mais recente para o mais antigo.
- Exibir título, texto, canal e data.
- Filtrar por telefone, e-mail, WhatsApp, presencial ou todos.
- Contador “N atendimentos” acompanha o filtro.
- Criar, editar e excluir atendimentos.

### 5.8 Página não encontrada

- Rota inexistente, como `/xyz`, exibe aviso e link para o Painel.
- Cliente inexistente, como `/clientes/999`, exibe “Cliente não encontrado”.

## 6. Pedidos: regras de negócio obrigatórias

- Novo pedido deve ter pelo menos um item.
- Cada item possui título, preço e quantidade.
- Título deve estar preenchido.
- Preço deve ser número maior ou igual a zero.
- Quantidade deve ser inteiro maior ou igual a 1.
- Total é calculado no app: `Σ (preço × quantidade)`.
- `aberto` pode mudar para `pago` ou `cancelado`.
- `pago` só pode mudar para `cancelado`.
- `cancelado` não muda mais; não exibir botões de mudança.
- Somente pedidos `aberto` permitem editar itens.
- Pedidos pagos ou cancelados ficam em modo de leitura.
- Excluir pedido exige confirmação.
- Após criar, editar, alterar status ou excluir, atualizar listas, selo do cliente e números do Painel.

### Selo do cliente

- **VIP:** total comprado de R$ 2.000,00 ou mais, sem contar cancelados.
- **Sem compras:** nenhum pedido válido.
- **Regular:** demais clientes com compras válidas.

### Top 3

Ordenar os três clientes com maior total comprado, excluindo pedidos cancelados.

## 7. Efeitos de transição e microinterações

Usar animações curtas, funcionais e consistentes. Evitar efeitos que atrasem tarefas.

| Efeito | Aplicação | Duração sugerida |
|---|---|---:|
| Fade + deslocamento vertical leve | Entrada de página | 160–220 ms |
| Realce de contorno | Item ativo do menu | 180 ms |
| Elevação de card | Hover em desktop | 150–200 ms |
| Brilho curto na borda | Hover/foco de botão | 150–220 ms |
| Scale + fade | Abertura de modal | 180–220 ms |
| Slide + overlay | Drawer mobile | 220–280 ms |
| Desenho de linha | Entrada de gráfico | 500–900 ms |
| Skeleton shimmer | Carregamento de listas | contínuo e discreto |
| Toast com fade/slide | Confirmação de ação | 180 ms |

### Efeitos que combinam com o conceito

1. **Digital Grid:** grade técnica muito sutil no fundo, sem movimento agressivo.
2. **Scanner Line:** linha ciano que percorre uma área durante carregamento ou atualização.
3. **Holographic Hover:** borda ganha brilho leve quando o card recebe hover.
4. **Energy Transition:** uma linha luminosa acompanha a troca de página, sem bloquear a navegação.
5. **KPI Count-up:** números contam até o valor final uma única vez, apenas quando os dados chegam.
6. **Status Pulse:** breve realce ao alterar status de pedido; não manter pulsação infinita.
7. **Modal Glass:** painel escuro com blur moderado e borda luminosa.
8. **Empty State:** ilustração linear minimalista com chamada para ação.

### Acessibilidade de movimento

Respeitar `prefers-reduced-motion`. Quando ativo, remover deslocamentos, contadores e efeitos de desenho; manter transições instantâneas ou fade mínimo. Nenhuma animação deve ser necessária para entender uma informação.

## 8. Estados de interface

Cada tela que consulta ou altera dados deve prever:

- **Loading:** skeleton ou indicador contextual.
- **Empty:** explicação do estado vazio e ação útil.
- **Error:** mensagem compreensível e opção de tentar novamente quando apropriado.
- **Success:** confirmação discreta após operação concluída.
- **Disabled:** ações indisponíveis visualmente claras, com justificativa quando necessário.
- **Validation:** erro associado ao campo correspondente.

Nenhum botão ou link deve ser apenas decorativo: todas as ações apresentadas devem funcionar.

## 9. API, autenticação e tratamento de erros

### Configuração

A API é executada localmente em `http://localhost:3333`. O frontend deve usar variável de ambiente:

```env
VITE_API_URL=http://localhost:3333
```

No código, obter a base URL por `import.meta.env.VITE_API_URL`. Não fixar a URL diretamente nos componentes.

### Autenticação

- `POST /auth/login` recebe `{ username, password }` e retorna `accessToken`.
- `GET /auth/me` retorna o usuário autenticado.
- Todas as demais rotas usam `Authorization: Bearer <accessToken>`.
- Ao receber 401, limpar a sessão e voltar ao Login.
- O token deixa de ser válido quando o servidor reinicia.
- A rota protegida originalmente solicitada deve ser restaurada após novo login.

### Rotas principais

| Método | Rota | Finalidade |
|---|---|---|
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Usuário logado |
| GET | `/clientes?q=&limit=&skip=` | Listagem, busca e paginação |
| GET / POST | `/clientes` | Listar/criar clientes |
| GET / PATCH / DELETE | `/clientes/:id` | Detalhar/editar/excluir cliente |
| GET | `/pedidos` | Todos os pedidos |
| GET / POST | `/clientes/:id/pedidos` | Listar/criar pedidos do cliente |
| PATCH / DELETE | `/pedidos/:id` | Editar/excluir pedido |
| GET / POST | `/clientes/:id/atendimentos` | Listar/criar atendimentos |
| PATCH / DELETE | `/atendimentos/:id` | Editar/excluir atendimento |

### Tratamento de erros obrigatório

Todas as chamadas devem usar `try/catch/finally`, com `setLoading(false)` no `finally`. Ler `res.ok` e `res.status` (fetch) ou `err.response?.status` (Axios).

| HTTP | Significado | Resposta de UI |
|---:|---|---|
| 400 | Dados inválidos | Orientar correção dos dados |
| 401 | Sessão expirada | Limpar sessão e voltar ao Login |
| 404 | Não encontrado | Mensagem de recurso inexistente |
| 409 | E-mail repetido | Informar que o e-mail já está cadastrado |
| 500 / rede | Falha no servidor ou conexão | Mensagem amigável e opção de tentar novamente |

## 10. Organização técnica sugerida

Stack exigida: Vite + React + TypeScript.

Estrutura de referência (adaptar ao repositório existente):

```text
src/
  app/
    routes/
    providers/
  components/
    layout/
    feedback/
    forms/
    data-display/
  pages/
    Login/
    Dashboard/
    Customers/
    CustomerDetails/
    CustomerForm/
    Orders/
    NotFound/
  services/
    api.ts
    auth.service.ts
    customers.service.ts
    orders.service.ts
    attendances.service.ts
  context/
    AuthContext.tsx
  hooks/
  utils/
    order.utils.ts
    customer.utils.ts
  styles/
    tokens.css
    global.css
```

Cálculos puros em `utils`: total do pedido, total comprado por cliente, selo e Top 3. Usar `map`, `filter`, `reduce` e `sort` sem mutar o estado. Compartilhar estado via Context onde fizer sentido.

## 11. Critérios de responsividade

- Validar em 375 px, 768 px, 1024 px e desktop amplo.
- Sem overflow horizontal.
- Cards em 2 colunas ou 1 coluna em telas estreitas.
- Sidebar recolhida/drawer em mobile.
- Formulários em uma coluna no celular.
- Modais limitados à altura da viewport e com conteúdo rolável.
- Tabelas adaptadas para cards ou rolagem interna controlada, nunca da página inteira.

## 12. Prompt mestre para outra IA

Copie o texto abaixo junto com este Markdown, o HTML, o CSS e a imagem conceitual:

> Você é uma pessoa desenvolvedora frontend sênior e designer UI/UX. Continue o projeto NEXUS CRM seguindo os arquivos de referência anexados.
>
> Antes de editar, examine o repositório e identifique a estrutura e o que já está implementado. Preserve funcionalidades existentes. Use o Markdown como especificação funcional e visual; use o HTML/CSS como referência gráfica de direção, não como substituto obrigatório da arquitetura React.
>
> A estética é futurista, inspirada na linguagem visual de TRON: fundo escuro, ciano e azul elétrico, linhas técnicas, superfícies com vidro discreto e glow controlado. Crie uma identidade original; não reproduza marcas ou elementos protegidos do filme.
>
> Implemente todas as telas e regras da prova, usando Vite + React + TypeScript e a API local documentada. Não invente endpoints, campos ou regras. Não mantenha dados mockados no produto final. Todo botão precisa executar uma ação real.
>
> Priorize clareza, acessibilidade, responsividade desde 375 px, estados de loading/empty/error/success e tratamento dos status HTTP 400, 401, 404, 409 e 500. Respeite `prefers-reduced-motion`.
>
> Centralize chamadas de API, autenticação e cálculos puros. Não mutar estado. Após implementar, execute `npm run build`, corrija erros e teste o fluxo completo. Ao final, informe o que foi feito, o que falta e eventuais limitações.

## 13. Checklist de aceite

- [ ] Login com token e rotas protegidas.
- [ ] Retorno à rota original depois do login.
- [ ] Nome do usuário vindo de `/auth/me`.
- [ ] Clientes: busca, paginação, detalhe, criar, editar e excluir.
- [ ] Confirmação de exclusão informa quantos pedidos e atendimentos serão apagados.
- [ ] Pedidos: criar, calcular total, editar itens, mudar status e excluir.
- [ ] Regras de transição de status respeitadas.
- [ ] Histórico: criar, editar, excluir, filtrar e contar.
- [ ] Painel e Top 3 desconsideram pedidos cancelados nos cálculos aplicáveis.
- [ ] Todos os pedidos mostram nome do cliente, filtros e ordenação.
- [ ] Estados loading, vazio, erro e sucesso.
- [ ] Erros HTTP tratados com mensagens visíveis.
- [ ] `/xyz` e cliente inexistente exibem mensagens apropriadas.
- [ ] Layout funciona em 375 px sem rolagem lateral.
- [ ] `npm run build` sem erros.
- [ ] README e commits no GitHub.

---

## 14. Nota de fidelidade à prova

Este guia organiza a direção visual e os requisitos informados na prova P2 de CRM de Clientes. Em caso de conflito entre uma sugestão estética deste documento e uma regra funcional da prova, **a prova prevalece**. O HTML/CSS de referência é uma proposta visual estática e não representa uma implementação integrada à API.
