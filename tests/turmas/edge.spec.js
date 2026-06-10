import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

// =====================================================
// LOGIN
// =====================================================

async function login(page) {

    const secret = '2DINPFKXGBLME2VO';
    const otp = authenticator.generate(secret);

    await page.goto('https://app.avaliei.com.br/login');

    await page.getByRole('textbox', { name: 'Email' })
        .fill('e2e-super-teacher-23@example.com');

    await page.getByRole('textbox', { name: 'Senha' })
        .fill('password');

    await page.getByRole('button', { name: 'Entrar' }).click();

    await page.getByRole('textbox', {
        name: /Código de verificação/i
    }).fill(otp);

    await page.getByRole('button', {
        name: /Verificar código/i
    }).click();

    await page.waitForURL(/dashboard/);

    // entra em Turmas corretamente
    await page.getByRole('button', { name: /turmas/i }).click();
    await page.getByRole('link', { name: /turmas/i }).click();
}

// =====================================================
// TESTES EDGE
// =====================================================

test.describe('EDGE - Turmas', () => {

    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    // =====================================================
    // helper
    // =====================================================

    async function abrirModal(page) {
        const btn = page.getByRole('button', {
            name: /Adicionar nova turma/i
        });

        await expect(btn).toBeVisible({ timeout: 15000 });
        await btn.click();

        await expect(
            page.getByRole('textbox', { name: /Ano/i })
        ).toBeVisible({ timeout: 10000 });
    }

    // =====================================================
    // EDGE 01
    // =====================================================

    test('Ano com letras', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', { name: 'Curso' }).click();
        await page.getByRole('option').first().click();

        await page.getByRole('textbox', { name: 'Ano: *' })
            .fill('abcd');

        await page.getByRole('button', { name: 'Salvar' }).click();
    });

    // =====================================================
    // EDGE 02
    // =====================================================

    test('Ano com dois dígitos', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', { name: 'Curso' }).click();
        await page.getByRole('option').first().click();

        await page.getByRole('textbox', { name: 'Ano: *' })
            .fill('34');

        await page.getByRole('button', { name: 'Salvar' }).click();
    });

    // =====================================================
    // EDGE 03
    // =====================================================

    test('Ano 9999', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', { name: 'Curso' }).click();
        await page.getByRole('option').first().click();

        await page.getByRole('textbox', { name: 'Ano: *' })
            .fill('9999');

        await page.getByRole('button', { name: 'Salvar' }).click();
    });

    // =====================================================
    // EDGE 04
    // =====================================================

    test('Sala muito longa', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', { name: 'Curso' }).click();
        await page.getByRole('option').first().click();

        await page.getByRole('textbox', { name: 'Ano: *' })
            .fill('2026');

        await page.getByRole('textbox', { name: /Sala/i })
            .fill('8'.repeat(80));

        await page.getByRole('button', { name: 'Salvar' }).click();
    });

    // =====================================================
    // EDGE 05
    // =====================================================

    test('Sala com caracteres especiais', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', { name: 'Curso' }).click();
        await page.getByRole('option').first().click();

        await page.getByRole('textbox', { name: 'Ano: *' })
            .fill('2026');

        await page.getByRole('textbox', { name: /Sala/i })
            .fill('!@#$$%');

        await page.getByRole('button', { name: 'Salvar' }).click();
    });

    // =====================================================
    // EDGE 06
    // =====================================================

    test('Descrição gigante', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', { name: 'Curso' }).click();
        await page.getByRole('option').first().click();

        await page.getByRole('textbox', { name: 'Ano: *' })
            .fill('2026');

        await page.getByRole('textbox', { name: /Descrição/i })
            .fill('A'.repeat(500));

        await page.getByRole('button', { name: 'Salvar' }).click();
    });

    // =====================================================
    // EDGE 07
    // =====================================================

    test('Descrição só espaços', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', { name: 'Curso' }).click();
        await page.getByRole('option').first().click();

        await page.getByRole('textbox', { name: 'Ano: *' })
            .fill('2026');

        await page.getByRole('textbox', { name: /Descrição/i })
            .fill('     ');

        await page.getByRole('button', { name: 'Salvar' }).click();
    });

    // =====================================================
    // EDGE 08
    // =====================================================

    test('Pesquisa com acento', async ({ page }) => {

        await page.getByRole('textbox', { name: /Pesquisar/i })
            .fill('Informática');

        await page.keyboard.press('Enter');
    });

    // =====================================================
    // EDGE 09
    // =====================================================

    test('Pesquisa minúscula', async ({ page }) => {

        await page.getByRole('textbox', { name: /Pesquisar/i })
            .fill('informática');

        await page.keyboard.press('Enter');
    });

});