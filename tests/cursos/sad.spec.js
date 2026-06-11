import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

// =====================================================
// LOGIN
// =====================================================

async function login(page) {
    const secret = '2DINPFKXGBLME2VO';

    await page.goto('https://app.avaliei.com.br/login');

    await page.getByRole('textbox', { name: 'Email' })
        .fill('e2e-super-teacher-23@example.com');

    await page.getByRole('textbox', { name: 'Senha' })
        .fill('password');

    await page.getByRole('button', { name: 'Entrar' }).click();

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

    await page.waitForURL(/dashboard/);

    await page.getByRole('button', {
        name: /turmas/i
    }).click();

    await page.getByText(/cursos/i).click();

    await page.waitForLoadState('networkidle');
}

// =====================================================
// HELPER — abrir modal
// =====================================================

async function abrirModal(page) {
    const btn = page.getByRole('button', {
        name: /Adicionar Curso/i
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

async function verificarRejeicao(page) {
    await expect(
        page.getByRole('button', {
            name: 'Salvar'
        })
    ).toBeVisible();
}

// =====================================================
// SAD - Cursos
// =====================================================

test.describe('SAD - Cursos', () => {

    test.describe.configure({
        mode: 'serial'
    });

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    // =====================================================
    // SAD 01 — Salvar vazio
    // =====================================================

    test('SAD 01 - Salvar vazio', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await verificarRejeicao(page);
    });

    // =====================================================
    // SAD 02 — Apenas nível de escolaridade
    // =====================================================

    test('SAD 02 - Apenas nível', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', {
            name: 'Nível de Escolaridade'
        }).click();

        await page.getByRole('option', {
            name: 'Técnico'
        }).click();

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await verificarRejeicao(page);
    });

    // =====================================================
    // SAD 03 — Abrir dropdown e cancelar
    // =====================================================

    test('SAD 03 - Abrir dropdown sem salvar', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('button', {
            name: 'Nível de Escolaridade'
        }).click();

        const cancelar = page.getByRole('button', {
            name: /cancelar/i
        });

        if (await cancelar.count() > 0) {
            await cancelar.click();
        }

        await verificarRejeicao(page);
    });

    // =====================================================
    // SAD 04 — Apenas nome do curso
    // =====================================================

    test('SAD 04 - Apenas nome', async ({ page }) => {

        await abrirModal(page);

        await page.getByRole('textbox', {
            name: 'Nome do Curso: *'
        }).fill('curso_teste_sad');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await verificarRejeicao(page);
    });
});