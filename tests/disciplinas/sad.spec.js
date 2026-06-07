import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

/**
 * Função para reutilizar o login em todos os testes SAD.
 */
async function fazerLogin(page) {

    const secret = '2DINPFKXGBLME2VO';
    const otp = authenticator.generate(secret);

    await page.goto('https://app.avaliei.com.br/login');

    await page.getByRole('textbox', {
        name: 'Email'
    }).fill('e2e-super-teacher-23@example.com');

    await page.getByRole('textbox', {
        name: 'Senha'
    }).fill('password');

    await page.getByRole('button', {
        name: 'Entrar'
    }).click();

    await page.getByRole('textbox', {
        name: /Código de verificação/i
    }).fill(otp);

    await page.getByRole('button', {
        name: /Verificar código/i
    }).click();

    await expect(page).toHaveURL(/dashboard/);
}

/**
 * SAD 01
 * Tenta criar uma disciplina sem preencher nenhum campo.
 */
test('SAD - Criar disciplina sem preencher campos obrigatórios', async ({ page }) => {

    await fazerLogin(page);

    // Acessa a tela de disciplinas
    await page.getByRole('link', {
        name: 'Disciplinas'
    }).click();

    // Abre o modal de cadastro
    await page.getByRole('button', {
        name: 'Adicionar disciplina'
    }).click();

    // Tenta salvar sem preencher nada
    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // Devem aparecer 2 mensagens:
    // 1 para Nome
    // 1 para Área
    await expect(
        page.getByText('Este campo é obrigatório')
    ).toHaveCount(2);
});

/**
 * SAD 02
 * Preenche o nome, mas não seleciona a área.
 */
test('SAD - Criar disciplina sem selecionar área', async ({ page }) => {

    await fazerLogin(page);

    await page.getByRole('link', {
        name: 'Disciplinas'
    }).click();

    await page.getByRole('button', {
        name: 'Adicionar disciplina'
    }).click();

    // Preenche apenas o nome
    await page.getByRole('textbox', {
        name: 'Nome da disciplina: *'
    }).fill('Cursinho');

    // Não seleciona a área
    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // Deve aparecer apenas 1 mensagem de campo obrigatório
    await expect(
        page.getByText('Este campo é obrigatório')
    ).toHaveCount(1);
});

/**
 * SAD 03
 * Seleciona a área, mas não informa o nome.
 */
test('SAD - Criar disciplina sem informar nome', async ({ page }) => {

    await fazerLogin(page);

    await page.getByRole('link', {
        name: 'Disciplinas'
    }).click();

    await page.getByRole('button', {
        name: 'Adicionar disciplina'
    }).click();

    // Seleciona apenas a área
    await page.getByRole('button', {
        name: 'Selecione a área da disciplina'
    }).click();

    await page.getByText(
        'Área Teste 1779989273359'
    ).click();

    // Não informa nome
    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // Deve aparecer erro apenas para o nome
    await expect(
        page.getByText('Este campo é obrigatório')
    ).toHaveCount(1);
});