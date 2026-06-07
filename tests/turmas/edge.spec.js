import { test } from '@playwright/test';
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

    await page.getByRole('link', {
        name: 'Turmas'
    }).click();
}

test.describe('EDGE - Turmas', () => {
 
    test.describe.configure({
    mode: 'serial'
    });
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    // =====================================================
    // EDGE 01 - Ano com letras
    // =====================================================

    test('Ano com letras', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Adicionar nova turma'
        }).click();

        await page.getByRole('button', {
            name: 'Curso'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('textbox', {
            name: 'Ano: *'
        }).fill('abcd');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 02 - Ano muito pequeno
    // =====================================================

    test('Ano com dois dígitos', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Adicionar nova turma'
        }).click();

        await page.getByRole('button', {
            name: 'Curso'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('textbox', {
            name: 'Ano: *'
        }).fill('34');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 03 - Ano muito alto
    // =====================================================

    test('Ano 9999', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Adicionar nova turma'
        }).click();

        await page.getByRole('button', {
            name: 'Curso'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('textbox', {
            name: 'Ano: *'
        }).fill('9999');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 04 - Sala muito grande
    // =====================================================

    test('Sala muito longa', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Adicionar nova turma'
        }).click();

        await page.getByRole('button', {
            name: 'Curso'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('textbox', {
            name: 'Ano: *'
        }).fill('2026');

        await page.getByRole('textbox', {
            name: 'Sala:'
        }).fill(
            '888888888888888888888888888888888888888888888888888888888888888888888888'
        );

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 05 - Sala com caracteres especiais
    // =====================================================

    test('Sala com caracteres especiais', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Adicionar nova turma'
        }).click();

        await page.getByRole('button', {
            name: 'Curso'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('textbox', {
            name: 'Ano: *'
        }).fill('2026');

        await page.getByRole('textbox', {
            name: 'Sala:'
        }).fill('!~@=');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 06 - Descrição gigante
    // =====================================================

    test('Descrição muito grande', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Adicionar nova turma'
        }).click();

        await page.getByRole('button', {
            name: 'Curso'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('textbox', {
            name: 'Ano: *'
        }).fill('2026');

        await page.getByRole('textbox', {
            name: 'Descrição:'
        }).fill('A'.repeat(1000));

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 07 - Apenas espaços na descrição
    // =====================================================

    test('Descrição apenas espaços', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Adicionar nova turma'
        }).click();

        await page.getByRole('button', {
            name: 'Curso'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('textbox', {
            name: 'Ano: *'
        }).fill('2026');

        await page.getByRole('textbox', {
            name: 'Descrição:'
        }).fill('          ');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 08 - Pesquisa com acento
    // =====================================================

    test('Pesquisa com acento', async ({ page }) => {

        await page.getByRole('textbox', {
            name: 'Pesquisar turma...'
        }).fill('Informática');

        await page.keyboard.press('Enter');
    });

    // =====================================================
    // EDGE 09 - Pesquisa minúscula
    // =====================================================

    test('Pesquisa minúscula', async ({ page }) => {

        await page.getByRole('textbox', {
            name: 'Pesquisar turma...'
        }).fill('informática');

        await page.keyboard.press('Enter');
    });

});