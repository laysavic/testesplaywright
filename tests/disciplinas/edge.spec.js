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
        name: /Adicionar disciplina/i
    });

    await expect(btn).toBeVisible({ timeout: 10000 });

    await btn.click();

    await expect(
        page.getByRole('textbox', {
            name: 'Nome da disciplina: *'
        })
    ).toBeVisible();
}

// =====================================================
// HELPER — preencher disciplina
// =====================================================

async function preencherDisciplina(page, nome) {
    await page.getByRole('textbox', {
        name: 'Nome da disciplina: *'
    }).fill(nome);

    await page.getByRole('button', {
        name: 'Selecione a área da disciplina'
    }).click();

    await page.getByRole('option').first().click();
}

// =====================================================
// HELPER — rejeição
// =====================================================

async function verificarRejeicao(page) {
    await expect(
        page.getByRole('button', {
            name: 'Salvar'
        })
    ).toBeVisible();
}

// =====================================================
// EDGE - Disciplinas
// =====================================================

test.describe('EDGE - Disciplinas', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    // =====================================================
    // EDGE 01 — Nome muito grande
    // =====================================================

    test('EDGE 01 - Nome muito grande', async ({ page }) => {
        await abrirModal(page);

        await preencherDisciplina(page, 'A'.repeat(100));

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await verificarRejeicao(page);
    });

    // =====================================================
    // EDGE 02 — Caracteres especiais
    // =====================================================

    test('EDGE 02 - Caracteres especiais', async ({ page }) => {
        await abrirModal(page);

        await preencherDisciplina(page, '@#$%¨&*()');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await verificarRejeicao(page);
    });

    // =====================================================
    // EDGE 03 — Apenas números
    // =====================================================

    test('EDGE 03 - Apenas números', async ({ page }) => {
        await abrirModal(page);

        await preencherDisciplina(page, '123456');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await verificarRejeicao(page);
    });

    // =====================================================
    // EDGE 04 — Letras e números
    // =====================================================

    test('EDGE 04 - Letras e números', async ({ page }) => {
        await abrirModal(page);

        await preencherDisciplina(page, 'Matematica2026');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await verificarRejeicao(page);
    });

    // =====================================================
    // EDGE 05 — Pesquisa sem resultados
    // =====================================================

    test('EDGE 05 - Pesquisa sem resultados', async ({ page }) => {
        await page.getByRole('textbox', {
            name: 'Pesquisar disciplina...'
        }).fill('xyz123teste');

        await page.keyboard.press('Enter');

        await expect(
            page.getByRole('table')
        ).toBeVisible();
    });

    // =====================================================
    // EDGE 06 — Espaços antes e depois
    // =====================================================

    test('EDGE 06 - Espaços antes e depois', async ({ page }) => {
        await abrirModal(page);

        await preencherDisciplina(
            page,
            '     Matemática     '
        );

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await verificarRejeicao(page);
    });
});