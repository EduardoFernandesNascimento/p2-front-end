// Gera screenshots de inspeção visual (uso manual, fora do versionamento)
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const Pasta = 'test-results/design';
fs.mkdirSync(Pasta, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto('http://localhost:5173/login');
await page.waitForTimeout(600);
await page.screenshot({ path: `${Pasta}/1-login.png` });

await page.getByLabel('Usuário').fill('emilys');
await page.locator('input[autocomplete="current-password"]').fill('emilyspass');
await page.getByRole('button', { name: 'Entrar' }).click();
await page.waitForURL(/\/$/);
await page.waitForTimeout(800);
await page.screenshot({ path: `${Pasta}/2-painel.png` });

await page.getByRole('link', { name: 'Clientes' }).click();
await page.waitForURL(/\/clientes$/);
await page.waitForTimeout(600);
await page.screenshot({ path: `${Pasta}/3-clientes.png` });

await page.getByRole('link', { name: 'Pedidos' }).click();
await page.waitForURL(/\/pedidos$/);
await page.waitForTimeout(600);
await page.screenshot({ path: `${Pasta}/4-pedidos.png` });

await page.getByRole('link', { name: 'Clientes' }).click();
await page.waitForURL(/\/clientes$/);
await page.locator('.lista-cartoes').first().click();
await page.waitForURL(/\/clientes\/\d+$/);
await page.waitForTimeout(600);
await page.screenshot({ path: `${Pasta}/5-detalhe.png` });

await browser.close();
console.log('Screenshots salvos em', Pasta);
