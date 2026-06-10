import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('HAPPY - CRUD de Áreas', async ({ page }) => {

    // =====================================================
    // LOGIN
    // =====================================================

    const secret = '2DINPFKXGBLME2VO';

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

    await page.waitForURL(/2fa/, {
        timeout: 15000
    });

    const otp = authenticator.generate(secret);

    await page.getByRole('textbox', {
        name: /Código de verificação/i
    }).fill(otp);

    await page.getByRole('button', {
        name: /Verificar código/i
    }).click();

    await page.waitForTimeout(3000);

    // =====================================================
    // ACESSAR ÁREAS
    // =====================================================

    await page.locator('button').filter({
        hasText: 'Disciplinas'
    }).first().click();

    await page.waitForTimeout(1000);

    await page.getByRole('link', {
        name: 'Áreas'
    }).click();

    await page.waitForTimeout(2000);

    // =====================================================
    // DADOS
    // =====================================================

    const nomeArea = `cursinho-${Date.now()}`;
    const nomeEditado = `cursinho-ENEM-${Date.now()}`;

    // =====================================================
    // CREATE
    // =====================================================

    await page.getByRole('button', {
        name: /Adicionar área/i
    }).click();

    await page.getByRole('textbox', {
        name: /Nome da Área/i
    }).fill(nomeArea);

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.waitForTimeout(1500);

    // =====================================================
    // READ
    // =====================================================

    await page.getByRole('textbox', {
        name: /Pesquisar área/i
    }).fill(nomeArea);

    await expect(
        page.getByText(nomeArea, {
            exact: true
        })
    ).toBeVisible();

    // =====================================================
    // UPDATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Editar'
    }).first().click();

    await page.getByRole('textbox', {
        name: /Nome da Área/i
    }).fill(nomeEditado);

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.waitForTimeout(1500);

    await page.getByRole('textbox', {
        name: /Pesquisar área/i
    }).fill(nomeEditado);

    await expect(
        page.getByText(nomeEditado, {
            exact: true
        })
    ).toBeVisible();

    // =====================================================
    // DELETE
    // =====================================================

    await page.getByRole('button', {
        name: 'Excluir'
    }).first().click();

    await page.getByRole('button', {
        name: /^Excluir$/
    }).last().click();

    await page.waitForTimeout(1500);
});