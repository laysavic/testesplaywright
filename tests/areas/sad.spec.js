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

    await page.getByRole('textbox', { name: 'Email' }).fill('e2e-super-teacher-23@example.com');
    await page.getByRole('textbox', { name: 'Senha' }).fill('password');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await page.waitForURL(/2fa-codigo/);
    const otp = authenticator.generate(secret);
    const timeRemaining = authenticator.timeRemaining();

    if (timeRemaining <= 5) {
        await page.waitForTimeout((timeRemaining + 1) * 1000);
        const freshOtp = authenticator.generate(secret);
        await page.getByRole('textbox', { name: /Código de verificação/i }).fill(freshOtp);
    } else {
        await page.getByRole('textbox', { name: /Código de verificação/i }).fill(otp);
    }

    await page.getByRole('button', { name: /Verificar código/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 20000 });

    await page.getByRole('button', { name: 'Disciplinas' }).click();
    await page.getByRole('link', { name: 'Áreas' }).click();
    await page.waitForLoadState('networkidle');
}

// =====================================================
// HELPER — abrir modal de nova área
// =====================================================

async function abrirModal(page) {
    const btn = page.getByRole('button', { name: /Adicionar área/i });
    await expect(btn).toBeVisible({ timeout: 15000 });
    await btn.click();

    await expect(
        page.getByRole('textbox', { name: /Nome da Área/i })
    ).toBeVisible({ timeout: 10000 });

    // ✅ Espera a animação do modal terminar
    await page.waitForTimeout(400);
}

// =====================================================
// HELPER — fechar modal
// =====================================================

async function fecharModal(page) {
    await page.keyboard.press('Escape');
    await expect(
        page.getByRole('button', { name: /Adicionar área/i })
    ).toBeVisible({ timeout: 10000 });
}

// =====================================================
// HELPER — verificar que o sistema rejeitou
// =====================================================

async function verificarRejeicao(page) {
    await expect(
        page.getByRole('button', { name: 'Salvar' })
    ).toBeVisible({ timeout: 5000 });

    await expect(
        page.getByRole('textbox', { name: /Nome da Área/i })
    ).toBeVisible();
}

// =====================================================
// SAD - Cadastro de Áreas
// =====================================================

test.describe('SAD - Cadastro de Áreas', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    // =====================================================
    // SAD 01 — Criar área sem preencher o nome
    // =====================================================

    test('SAD 01 - Criar área sem preencher o nome', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        await expect(
            page.getByText(/Este campo é obrigatório/i)
        ).toBeVisible({ timeout: 5000 });

        await fecharModal(page);
    });

    // =====================================================
    // SAD 02 — Criar área apenas com espaços
    // =====================================================

    test('SAD 02 - Criar área apenas com espaços', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: /Nome da Área/i }).fill('   ');

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        await verificarRejeicao(page);
        await fecharModal(page);
    });

    // =====================================================
    // SAD 03 — Criar área duplicada
    // =====================================================

    test('SAD 03 - Criar área duplicada', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: /Nome da Área/i })
            .fill('Ciências da natureza e suas tecnologias');

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        await expect(
            page.getByText(/já existe|duplicad/i)
        ).toBeVisible({ timeout: 10000 });

        await fecharModal(page);
    });

    // =====================================================
    // SAD 04 — Editar área deixando o nome vazio
    // =====================================================

    test('SAD 04 - Editar área deixando o nome vazio', async ({ page }) => {
        await expect(
            page.getByRole('button', { name: 'Editar' }).first()
        ).toBeVisible({ timeout: 15000 });

        await page.getByRole('button', { name: 'Editar' }).nth(5).click();

        await expect(
            page.getByRole('textbox', { name: /Nome da Área/i })
        ).toBeVisible({ timeout: 10000 });

        // ✅ Espera animação do modal
        await page.waitForTimeout(400);

        await page.getByRole('textbox', { name: /Nome da Área/i }).clear();

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        await expect(
            page.getByText(/Este campo é obrigatório/i)
        ).toBeVisible({ timeout: 5000 });

        await fecharModal(page);
    });

    // =====================================================
    // SAD 05 — Pesquisar área inexistente
    // =====================================================

    test('SAD 05 - Pesquisar área inexistente', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Pesquisar área...' }).fill('global');

        await expect(
            page.getByText(/nenhuma área encontrada/i)
        ).toBeVisible({ timeout: 10000 });
    });

});