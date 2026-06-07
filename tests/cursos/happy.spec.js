import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('HAPPY - CRUD de Cursos', async ({ page }) => {

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
    // ACESSAR CURSOS
    // =====================================================

    await page.getByRole('link', {
        name: 'Cursos'
    }).click();

    // =====================================================
    // CREATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Curso'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do Curso: *'
    }).fill('enem');

    await page.getByRole('button', {
        name: 'Nível de Escolaridade'
    }).click();

    await page.getByRole('option', {
        name: 'Médio'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // READ
    // =====================================================

    await page.getByRole('textbox', {
        name: /Pesquisar/i
    }).fill('enem');

    await expect(
        page.getByText('enem')
    ).toBeVisible();

    // =====================================================
    // UPDATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Editar'
    }).last().click();

    await page.getByRole('textbox', {
        name: 'Nome do Curso: *'
    }).fill('cursinho de iniciantes');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // READ APÓS UPDATE
    // =====================================================

    await page.getByRole('textbox', {
        name: /Pesquisar/i
    }).fill('cursinho');

    await expect(
        page.getByText('cursinho de iniciantes')
    ).toBeVisible();

    // =====================================================
    // DELETE
    // =====================================================

    await page.getByRole('button', {
        name: 'Excluir'
    }).last().click();

    await page.getByRole('button', {
        name: 'Excluir'
    }).click();
});