import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

async function login(page) {

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

    // Espera o dashboard carregar
    await page.waitForURL(/dashboard/);

    // Espera o menu aparecer
    await expect(
        page.getByRole('link', { name: 'Cursos' })
    ).toBeVisible();

    await page.getByRole('link', {
        name: 'Cursos'
    }).click();
}

test('SAD - Cadastro de Cursos', async ({ page }) => {

    // =====================================================
    // LOGIN
    // =====================================================

    await login(page);

    // =====================================================
    // SAD 1 - Salvar sem preencher nenhum campo
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Curso'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // SAD 2 - Selecionar apenas nível
    // =====================================================

    await page.getByRole('button', {
        name: 'Nível de Escolaridade'
    }).click();

    await page.getByRole('option', {
        name: 'Técnico'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // SAD 3 - Abrir e fechar seleção de nível
    // =====================================================

    await page.getByRole('button', {
        name: 'Nível de Escolaridade'
    }).click();

    // =====================================================
    // SAD 4 - Informar apenas nome
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Nome do Curso: *'
    }).fill('curso_teste_sad');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();
});