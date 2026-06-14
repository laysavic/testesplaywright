import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

// =====================================================
// LOGIN
// =====================================================

async function login(page) {
    const secret = 'HXEVA6OMYITVPBS2';

    await page.goto('https://app.avaliei.com.br/login');

    await expect(
        page.getByRole('textbox', { name: 'Email' })
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('textbox', {
        name: 'Email'
    }).fill('e2e-super-teacher-23@example.com');

    await page.getByRole('textbox', {
        name: 'Senha'
    }).fill('password');

    await page.getByRole('button', {
        name: 'Entrar'
    }).click();

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
        name: /turmas/i
    }).click();

    await page.getByRole('link', {
        name: /cursos/i
    }).click();

    await page.waitForLoadState('networkidle');
}

// =====================================================
// HELPER — Abrir modal
// =====================================================

async function abrirModal(page) {
    const botao = page.getByRole('button', {
        name: /Adicionar Curso/i
    });

    await expect(botao).toBeVisible({
        timeout: 15000
    });

    await botao.click();

    await expect(
        page.getByRole('textbox', {
            name: /Nome do Curso/i
        })
    ).toBeVisible({
        timeout: 10000
    });
}

// =====================================================
// HELPER — Preencher formulário
// =====================================================

async function preencherCurso(page, nome) {

    await page.getByRole('textbox', {
        name: /Nome do Curso/i
    }).fill(nome);

    await page.getByRole('button', {
        name: 'Nível de Escolaridade'
    }).click();

    await page.getByRole('option')
        .first()
        .click();
}

// =====================================================
// EDGE - Cursos
// =====================================================

test.describe('EDGE - Cadastro de Cursos', () => {

    test.describe.configure({
        mode: 'serial'
    });

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    // =====================================================
    // EDGE 01 - Nome com 1 caractere
    // =====================================================

    test('EDGE 01 - Nome com 1 caractere', async ({ page }) => {

        await abrirModal(page);
        await preencherCurso(page, 'a');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 02 - Nome muito longo
    // =====================================================

    test('EDGE 02 - Nome muito longo', async ({ page }) => {

        await abrirModal(page);
        await preencherCurso(page, 'a'.repeat(200));

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 03 - Nome com números
    // =====================================================

    test('EDGE 03 - Nome com números', async ({ page }) => {

        await abrirModal(page);
        await preencherCurso(page, 'curso123456');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 04 - Espaços internos
    // =====================================================

    test('EDGE 04 - Espaços internos', async ({ page }) => {

        await abrirModal(page);
        await preencherCurso(page, 'curso     com     espaços');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 05 - Apenas maiúsculas
    // =====================================================

    test('EDGE 05 - Apenas maiúsculas', async ({ page }) => {

        await abrirModal(page);
        await preencherCurso(page, 'CURSO EDGE TESTE');

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // EDGE 06 - Pesquisa parcial
    // =====================================================

    test('EDGE 06 - Pesquisa parcial', async ({ page }) => {

        const search = page.getByRole('textbox', {
            name: /Pesquisar/i
        });

        await search.fill('cur');
        await search.press('Enter');

        await expect(
            page.getByRole('table')
        ).toBeVisible({
            timeout: 10000
        });
    });

    // =====================================================
    // EDGE 07 - Pesquisa com acento
    // =====================================================

    test('EDGE 07 - Pesquisa com acento', async ({ page }) => {

        const search = page.getByRole('textbox', {
            name: /Pesquisar/i
        });

        await search.fill('líng');
        await search.press('Enter');

        await expect(
            page.getByRole('table')
        ).toBeVisible({
            timeout: 10000
        });
    });

    // =====================================================
    // EDGE 08 - Limpar pesquisa
    // =====================================================

    test('EDGE 08 - Limpar pesquisa', async ({ page }) => {

        const search = page.getByRole('textbox', {
            name: /Pesquisar/i
        });

        await search.fill('');
        await search.press('Enter');

        await expect(
            page.getByRole('table')
        ).toBeVisible({
            timeout: 10000
        });
    });

});