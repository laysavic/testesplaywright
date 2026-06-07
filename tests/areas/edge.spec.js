import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('EDGE - Cadastro de Áreas', async ({ page }) => {

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
    // EDGE 1 - NOME COM 1 CARACTERE
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar área'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da Área:'
    }).fill('a');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 2 - NOME MUITO GRANDE
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar área'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da Área:'
    }).fill(
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    );

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 3 - NOME COM ACENTO
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar área'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da Área:'
    }).fill('língua estrangeira');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 4 - NOME COM CARACTERES ESPECIAIS
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar área'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da Área:'
    }).fill('@!*');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 5 - NOME COM NÚMEROS
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar área'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da Área:'
    }).fill('uhyu7777');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 6 - PESQUISA PARCIAL
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar área...'
    }).fill('ling');

    // =====================================================
    // EDGE 7 - PESQUISA COM ACENTO
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar área...'
    }).fill('líng');

    // =====================================================
    // EDGE 8 - PESQUISA EM MAIÚSCULO
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar área...'
    }).fill('CIENC');

    // =====================================================
    // EDGE 9 - LIMPAR PESQUISA
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar área...'
    }).fill('');
});