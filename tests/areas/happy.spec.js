import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('HAPPY - CRUD de Áreas', async ({ page }) => {

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
    // ACESSAR ÁREAS
    // =====================================================

    await page.getByRole('link', {
        name: 'Áreas'
    }).click();

    // =====================================================
    // CREATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar área'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da Área:'
    }).fill('cursinho');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // READ (PESQUISAR)
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar área...'
    }).fill('cursinho');

    await expect(page.getByText('cursinho')).toBeVisible();

    // =====================================================
    // UPDATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Editar'
    }).last().click();

    await page.getByRole('textbox', {
        name: 'Nome da Área:'
    }).fill('cursinho ENEM');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // DELETE
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar área...'
    }).fill('cursinho ENEM');

    await page.getByRole('button', {
        name: 'Excluir'
    }).last().click();

    await page.getByRole('button', {
        name: 'Excluir'
    }).click();
});