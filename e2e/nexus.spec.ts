import { expect, test } from '@playwright/test';

/**
 * Validação E2E clique a clique — NEXUS CRM (P2)
 * Fluxo: login (erro + toggle senha + sucesso) → painel → clientes →
 * criar cliente → detalhe → pedido (criar/pagar/cancelar) → histórico →
 * todos os pedidos → 404 → limpeza (excluir cliente) → sair.
 * Requer API local em http://localhost:3333 e app em http://localhost:5173.
 */

const CLIENTE = 'QA E2E';
const EMAIL = 'qa-e2e@teste.com';
const LIMPAR = true;

test('fluxo completo clique a clique', async ({ page, request }) => {
  test.setTimeout(120000);

  // reinicia o estado do stub (exclusivo do ambiente de teste)
  await request.post('http://localhost:3333/__reset');

  /* ---------- 1. LOGIN ---------- */
  await page.goto('/');
  // rota protegida redireciona para /login
  await page.waitForURL(/\/login$/);
  await expect(page.getByRole('heading', { name: /Acesso ao CRM/ })).toBeVisible();

  // credencial inválida
  await page.getByLabel('Usuário').fill('quem-sou-eu');
  await page.locator('input[autocomplete="current-password"]').fill('senha-errada');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('Usuário ou senha inválidos.')).toBeVisible();

  // toggle mostrar/ocultar senha
  const senha = page.locator('input[autocomplete="current-password"]');
  await expect(senha).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Mostrar senha' }).click();
  await expect(senha).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ocultar senha' }).click();
  await expect(senha).toHaveAttribute('type', 'password');

  // login válido
  await page.getByLabel('Usuário').fill('emilys');
  await page.locator('input[autocomplete="current-password"]').fill('emilyspass');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/$/);
  await expect(page.getByRole('heading', { name: /Visão geral/ })).toBeVisible();
  await expect(page.getByText('Emily Santos').first()).toBeVisible();

  /* ---------- 2. PAINEL ---------- */
  await expect(page.getByText('Total de clientes')).toBeVisible();
  await expect(page.getByText('Total vendido')).toBeVisible();
  await expect(page.getByText('Ticket médio')).toBeVisible();
  await expect(page.getByText('Pedidos por status')).toBeVisible();
  await expect(page.getByText('Top clientes')).toBeVisible();

  /* ---------- 3. CLIENTES ---------- */
  await page.getByRole('link', { name: 'Clientes' }).click();
  await page.waitForURL(/\/clientes$/);
  await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();

  /* ---------- 4. CRIAR CLIENTE (validação + sucesso) ---------- */
  await page.getByRole('link', { name: /Novo cliente/ }).first().click();
  await page.waitForURL(/\/clientes\/novo$/);

  // validação: enviar vazio
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Informe o nome.')).toBeVisible();
  await expect(page.getByText('Informe o e-mail.')).toBeVisible();
  await expect(page.locator('.erro-campo').getByText(/Preencha pelo menos 2 entre/)).toBeVisible();

  // validar e-mail inválido
  await page.getByLabel('Nome *').fill(CLIENTE);
  await page.getByLabel('E-mail *').fill('nao-e-email');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('E-mail inválido.')).toBeVisible();

  // preencher corretamente
  await page.getByLabel('E-mail *').fill(EMAIL);
  await page.getByLabel('Telefone').fill('11 99999-0000');
  await page.getByLabel('Empresa').fill('QA Corp');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForURL(/\/clientes$/);
  await expect(page.getByText('Cliente criado.')).toBeVisible();

  // busca pelo cliente criado
  await page.locator('input[type="search"]').fill(EMAIL);
  await expect(page.locator('.lista-cartoes').getByText(CLIENTE)).toBeVisible();

  /* ---------- 5. DETALHE DO CLIENTE ---------- */
  await page.locator('.lista-cartoes').getByText(CLIENTE).click();
  await page.waitForURL(/\/clientes\/\d+$/);
  await expect(page.getByRole('heading', { name: CLIENTE })).toBeVisible();
  await expect(page.getByText('Sem compras')).toBeVisible();
  await expect(page.getByText('R$ 0,00')).toBeVisible();

  /* ---------- 6. PEDIDO: criar / status / regras ---------- */
  await page.getByRole('button', { name: '+ Novo pedido' }).click();
  // validação de item vazio
  await page.getByRole('button', { name: 'Criar pedido' }).click();
  await expect(page.getByText('Item 1: preencha o título.')).toBeVisible();

  await page.getByLabel('Título').fill('Serviço de teste');
  await page.getByLabel(/Preço/).fill('150,50');
  await page.getByLabel(/Qtd/).fill('2');
  await expect(page.getByText('Total: R$ 301,00')).toBeVisible();
  await page.getByRole('button', { name: 'Criar pedido' }).click();
  await expect(page.getByText('Pedido criado.')).toBeVisible();
  await expect(page.locator('.lista-pedidos').getByText(/Pedido #\d+/)).toBeVisible();
  await expect(page.locator('.lista-pedidos').getByText('Total: R$ 301,00')).toBeVisible();

  // aberto → pago (sem confirmação)
  await page.getByRole('button', { name: 'Marcar como pago' }).click();
  await expect(page.getByText(/agora está pago/)).toBeVisible();
  await expect(page.locator('.lista-pedidos .status-pago')).toBeVisible();

  // pago → cancelado (modal de confirmação)
  await page.getByRole('button', { name: 'Cancelar pedido' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expect(page.getByText(/não muda mais/)).toBeVisible();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancelar pedido' }).click();
  await expect(page.getByText(/agora está cancelado/)).toBeVisible();
  await expect(page.locator('.lista-pedidos .status-cancelado')).toBeVisible();
  // cancelado: sem botões de mudança
  await expect(page.getByRole('button', { name: 'Marcar como pago' })).toHaveCount(0);
  await expect(page.getByText('itens só para leitura')).toBeVisible();

  /* ---------- 7. HISTÓRICO DE ATENDIMENTO ---------- */
  await page.getByRole('button', { name: '+ Novo atendimento' }).click();
  await page.getByLabel('Título').fill('Contato inicial');
  await page.getByLabel('Texto').fill('Cliente entrou em contato por telefone.');
  await page.getByRole('button', { name: 'Salvar' }).first().click();
  await expect(page.getByText('Atendimento registrado.')).toBeVisible();
  await expect(page.getByText('Contato inicial')).toBeVisible();

  // filtro por canal
  const canal = page.getByLabel('Canal');
  await canal.selectOption('email');
  await expect(page.getByText('Nenhum atendimento neste canal.')).toBeVisible();
  await canal.selectOption('telefone');
  await expect(page.getByText('Contato inicial')).toBeVisible();
  await expect(page.getByText('1 atendimento')).toBeVisible();
  await canal.selectOption('todos');

  // editar atendimento
  await page.locator('.lista-atendimentos').getByRole('button', { name: 'Editar' }).click();
  const formEdit = page.locator('.bloco-form');
  await formEdit.getByLabel('Texto').fill('Contato atualizado por WhatsApp.');
  await formEdit.getByLabel('Canal').selectOption('whatsapp');
  await formEdit.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Atendimento atualizado.')).toBeVisible();
  await expect(page.getByText('Contato atualizado por WhatsApp.')).toBeVisible();

  // excluir atendimento (modal)
  await page.locator('.lista-atendimentos').getByRole('button', { name: 'Excluir' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir' }).click();
  await expect(page.getByText('Atendimento excluído.')).toBeVisible();
  await expect(page.getByText('Nenhum atendimento registrado.')).toBeVisible();

  /* ---------- 8. TODOS OS PEDIDOS + nome do cliente ---------- */
  await page.getByRole('link', { name: 'Pedidos' }).click();
  await page.waitForURL(/\/pedidos$/);
  await expect(page.getByRole('heading', { name: 'Todos os pedidos' })).toBeVisible();
  await expect(page.locator('.lista-cartoes').getByText(CLIENTE)).toBeVisible();

  // filtro por status: o pedido do QA é cancelado, então só aparece em "cancelado"
  const statusFiltro = page.getByLabel('Status');
  await statusFiltro.selectOption('aberto');
  await expect(page.locator('.lista-cartoes').getByText(CLIENTE)).toHaveCount(0);
  await statusFiltro.selectOption('cancelado');
  await expect(page.locator('.lista-cartoes').getByText(CLIENTE)).toBeVisible();
  await statusFiltro.selectOption('todos');

  /* ---------- 9. PÁGINA NÃO ENCONTRADA ---------- */
  await page.goto('/xyz');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
  await page.getByRole('link', { name: 'Ir para o Painel' }).click();
  await page.waitForURL(/\/$/);

  // cliente inexistente
  await page.goto('/clientes/999999');
  await expect(page.getByRole('heading', { name: 'Cliente não encontrado' })).toBeVisible();

  /* ---------- 10. LIMPEZA: excluir cliente de teste (modal com contagens) ---------- */
  if (LIMPAR) {
    await page.goto('/clientes');
    await page.locator('input[type="search"]').fill(EMAIL);
    await page.locator('.lista-cartoes').getByText(CLIENTE).click();
    await page.waitForURL(/\/clientes\/\d+$/);
    await page.locator('.dados-cliente').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expect(page.getByText(/1 pedido\(s\) e 0 atendimento\(s\)/)).toBeVisible();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Cliente excluído.')).toBeVisible();
    await page.waitForURL(/\/clientes$/);
    await page.locator('input[type="search"]').fill(EMAIL);
    await expect(page.getByText(/Nenhum cliente encontrado/)).toBeVisible();
  }

  /* ---------- 11. SAIR ---------- */
  await page.getByRole('button', { name: 'Sair' }).click();
  await page.waitForURL(/\/login$/);
  await expect(page.getByRole('heading', { name: /Acesso ao CRM/ })).toBeVisible();
});
