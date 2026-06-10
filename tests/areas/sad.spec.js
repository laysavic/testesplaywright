import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('SAD - Cadastro de Áreas', async ({ page }) => {

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

    await page.waitForURL(/dashboard/);

    // =====================================================
    // ACESSAR ÁREAS
    // =====================================================

    await page.getByRole('button', {
        name: 'Disciplinas'
    }).click();
    await page.waitForTimeout(500);

    await page.getByRole('link', {
        name: 'Áreas'
    }).click();

    // =====================================================
    // SAD 1 - CRIAR ÁREA SEM PREENCHER O NOME
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar área'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.getByRole('button', {
        name: 'Close'
    }).click();

    // =====================================================
    // SAD 2 - CRIAR ÁREA APENAS COM ESPAÇOS
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar área'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da Área:'
    }).fill('   ');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.getByRole('button', {
        name: 'Close'
    }).click();

    // =====================================================
    // SAD 3 - CRIAR ÁREA DUPLICADA
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar área'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da Área:'
    }).fill('Ciências da natureza e suas tecnologias');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // Fecha modal caso permaneça aberta
    await page.getByRole('button', {
        name: 'Close'
    }).click();

    // =====================================================
    // SAD 4 - EDITAR ÁREA DEIXANDO O NOME VAZIO
    // =====================================================

    await page.getByRole('button', {
        name: 'Editar'
    }).nth(5).click();

    await page.getByRole('textbox', {
        name: 'Nome da Área:'
    }).fill('');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.getByRole('button', {
        name: 'Close'
    }).click();

    // =====================================================
    // SAD 5 - PESQUISAR ÁREA INEXISTENTE
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar área...'
    }).fill('global');

});