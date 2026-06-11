import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

// =====================================================
// LOGIN
// =====================================================

async function login(page) {
    const secret = '2DINPFKXGBLME2VO';

    await page.goto('https://app.avaliei.com.br/login');

    await expect(
        page.getByRole('textbox', { name: 'Email' })
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('textbox', { name: 'Email' })
        .fill('e2e-super-teacher-23@example.com');

    await page.getByRole('textbox', { name: 'Senha' })
        .fill('password');

    await page.getByRole('button', { name: 'Entrar' })
        .click();

    await page.waitForURL(/2fa-codigo/);

    const otp = authenticator.generate(secret);
    const timeRemaining = authenticator.timeRemaining();

    if (timeRemaining <= 5) {
        await page.waitForTimeout((timeRemaining + 1) * 1000);

        const freshOtp = authenticator.generate(secret);

        await page.getByRole('textbox', {
            name: /Código de verificação/i
        }).fill(freshOtp);
    } else {
        await page.getByRole('textbox', {
            name: /Código de verificação/i
        }).fill(otp);
    }

    await page.getByRole('button', {
        name: /Verificar código/i
    }).click();

    await page.waitForURL(/dashboard/, {
        timeout: 20000
    });
}

// =====================================================
// HELPER — abrir disciplinas
// =====================================================

async function abrirDisciplinas(page) {
    await page.getByRole('button', {
        name: 'Disciplinas'
    }).click();

    await page.getByRole('link', {
        name: 'Disciplinas'
    }).click();

    await page.waitForLoadState('networkidle');
}

// =====================================================
// HELPER — abrir modal
// =====================================================

async function abrirModal(page) {
    const btn = page.getByRole('button', {
        name: 'Adicionar disciplina'
    });

    await expect(btn).toBeVisible({
        timeout: 15000
    });

    await btn.click();

    await expect(
        page.getByRole('button', {
            name: 'Salvar'
        })
    ).toBeVisible();
}

// =====================================================
// HELPER — verificar rejeição
// =====================================================

async function verificarRejeicao(page, quantidade = 1) {
    await expect(
        page.getByText('Este campo é obrigatório')
    ).toHaveCount(quantidade);
}

// =====================================================
// SAD - Disciplinas
// =====================================================

test.describe('SAD - Disciplinas', () => {

    test.describe.configure({
        mode: 'serial'
    });

    test.beforeEach(async ({ page }) => {
        await login(page);
        await abrirDisciplinas(page);
    });

    // =====================================================
    // SAD 01 — Criar disciplina sem preencher campos
    // =====================================================

    test('SAD 01 - Criar disciplina sem preencher campos obrigatórios', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await verificarRejeicao(page, 2);
    });

    // =====================================================
    // SAD 02 — Criar disciplina sem selecionar área
    // =====================================================

    test('SAD 02 - Criar disciplina sem selecionar área', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('textbox', {
            name: 'Nome da disciplina: *'
        }).fill('Cursinho');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await verificarRejeicao(page, 1);
    });

    // =====================================================
    // SAD 03 — Criar disciplina sem informar nome
    // =====================================================

    test('SAD 03 - Criar disciplina sem informar nome', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', {
            name: 'Selecione a área da disciplina'
        }).click();

        await page.getByLabel('Suggestions')
            .getByText('Linguagens, códigos e suas')
            .click();

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await verificarRejeicao(page, 1);
    });

});