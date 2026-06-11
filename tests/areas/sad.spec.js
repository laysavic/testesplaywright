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

    await page.getByRole('textbox', { name: 'Email' }).fill('e2e-super-teacher-23@example.com');
    await page.getByRole('textbox', { name: 'Senha' }).fill('password');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // ✅ OTP gerado depois de chegar na tela 2FA para não expirar
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
    // ✅ Modal continua aberto
    await expect(
        page.getByRole('button', { name: 'Salvar' })
    ).toBeVisible({ timeout: 5000 });

    // ✅ Nenhum toast de sucesso apareceu
    await expect(
        page.getByText(/salvo com sucesso/i)
    ).not.toBeVisible();
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
    // Verifica se o sistema exibe mensagem de erro ao
    // tentar salvar sem preencher o campo obrigatório.
    // =====================================================

    test('SAD 01 - Criar área sem preencher o nome', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar — nome obrigatório
        await expect(
            page.getByText(/Este campo é obrigatório/i)
        ).toBeVisible({ timeout: 5000 });

        await fecharModal(page);
    });

    // =====================================================
    // SAD 02 — Criar área apenas com espaços
    // Verifica se o sistema rejeita um nome composto
    // apenas de espaços em branco, que não tem valor real.
    // =====================================================

    test('SAD 02 - Criar área apenas com espaços', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: /Nome da Área/i }).fill('   ');

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar — campo vazio disfarçado
        await verificarRejeicao(page);
        await fecharModal(page);
    });

    // =====================================================
    // SAD 03 — Criar área duplicada
    // Verifica se o sistema impede o cadastro de uma
    // área com nome idêntico a uma já existente.
    // =====================================================

    test('SAD 03 - Criar área duplicada', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: /Nome da Área/i })
            .fill('Ciências da natureza e suas tecnologias');

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar — área já existe
        await expect(
            page.getByText(/já existe|duplicad/i)
        ).toBeVisible({ timeout: 10000 });

        await fecharModal(page);
    });

    // =====================================================
    // SAD 04 — Editar área deixando o nome vazio
    // Verifica se o sistema impede salvar uma área
    // existente após apagar completamente o nome.
    // =====================================================

    test('SAD 04 - Editar área deixando o nome vazio', async ({ page }) => {
        // ✅ Espera a tabela carregar antes de clicar em Editar
        await expect(
            page.getByRole('button', { name: 'Editar' }).first()
        ).toBeVisible({ timeout: 15000 });

        await page.getByRole('button', { name: 'Editar' }).nth(5).click();

        await expect(
            page.getByRole('textbox', { name: /Nome da Área/i })
        ).toBeVisible({ timeout: 10000 });

        await page.getByRole('textbox', { name: /Nome da Área/i }).clear();

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar — nome obrigatório
        await expect(
            page.getByText(/Este campo é obrigatório/i)
        ).toBeVisible({ timeout: 5000 });

        await fecharModal(page);
    });

    // =====================================================
    // SAD 05 — Pesquisar área inexistente
    // Verifica se o sistema exibe mensagem adequada
    // quando nenhuma área é encontrada na busca.
    // =====================================================

    test('SAD 05 - Pesquisar área inexistente', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Pesquisar área...' }).fill('global');

        // ✅ Sistema deve mostrar mensagem de vazio
        await expect(
            page.getByText(/nenhuma área encontrada/i)
        ).toBeVisible({ timeout: 10000 });
    });

});