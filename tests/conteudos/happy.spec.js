import { test } from '@playwright/test';
import { authenticator } from 'otplib';

test('HAPPY - CRUD de Conteúdos', async ({ page }) => {

    // =====================================================
    // LOGIN
    // =====================================================

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

    // =====================================================
    // ACESSAR CONTEÚDOS
    // =====================================================

    await page.getByRole('link', {
        name: 'Conteúdos'
    }).click();

    // =====================================================
    // CREATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('prismas');

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByPlaceholder('Pesquisar disciplina...')
        .fill('m');

    await page.getByRole('option', {
        name: 'Matemática'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // READ (PESQUISAR)
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('pri');

    // =====================================================
    // UPDATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Editar',
        exact: true
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('prismass');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // DELETE
    // =====================================================

    await page.getByRole('button', {
        name: 'Excluir',
        exact: true
    }).click();

    await page.getByRole('button', {
        name: 'Excluir'
    }).click();
});