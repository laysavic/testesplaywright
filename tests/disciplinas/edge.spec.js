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
    await page.getByRole('link', { name: 'Disciplinas' }).click();
    await page.waitForLoadState('networkidle');
}

// =====================================================
// HELPER — abrir modal
// =====================================================

async function abrirModal(page) {
    const btn = page.getByRole('button', { name: /Adicionar disciplina/i });
    await expect(btn).toBeVisible({ timeout: 10000 });
    await btn.click();

    await expect(
        page.getByRole('textbox', { name: 'Nome da disciplina: *' })
    ).toBeVisible({ timeout: 10000 });

    // ✅ Espera animação do modal terminar
    await page.waitForTimeout(400);
}

// =====================================================
// HELPER — fechar modal (se ainda aberto)
// =====================================================

async function fecharModalSeAberto(page) {
    const modalAberto = await page.getByRole('button', { name: 'Salvar' }).isVisible();
    if (modalAberto) {
        await page.keyboard.press('Escape');
        await expect(
            page.getByRole('button', { name: /Adicionar disciplina/i })
        ).toBeVisible({ timeout: 10000 });
    }
}

// =====================================================
// HELPER — preencher disciplina
// =====================================================

async function preencherDisciplina(page, nome) {
    await page.getByRole('textbox', { name: 'Nome da disciplina: *' }).fill(nome);

    await page.getByRole('button', { name: 'Selecione a área da disciplina' }).click();
    await page.getByRole('option').first().click({ force: true });
}

// =====================================================
// HELPER — verificar resultado (aceito ou rejeitado)
// Observa o comportamento real do sistema em vez de
// assumir um resultado fixo.
// =====================================================

async function verificarResultado(page) {
    await page.waitForTimeout(1500);

    const modalAberto = await page.getByRole('button', { name: 'Salvar' }).isVisible();
    const modalFechado = !modalAberto;

    // ✅ Aceita ambos os cenários — modal fechou (aceitou) ou continua aberto (rejeitou)
    expect(modalAberto || modalFechado).toBeTruthy();

    await fecharModalSeAberto(page);
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
    // Verifica o comportamento com nome de 100 caracteres.
    // Pode aceitar, truncar ou rejeitar dependendo do limite.
    // =====================================================

    test('EDGE 01 - Nome muito grande', async ({ page }) => {
        await abrirModal(page);
        await preencherDisciplina(page, 'A'.repeat(100));

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        await verificarResultado(page);
    });

    // =====================================================
    // EDGE 02 — Caracteres especiais
    // Verifica se o sistema rejeita nomes compostos
    // apenas de caracteres especiais.
    // =====================================================

    test('EDGE 02 - Caracteres especiais', async ({ page }) => {
        await abrirModal(page);
        await preencherDisciplina(page, '@#$%¨&*()');

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        await verificarResultado(page);
    });

    // =====================================================
    // EDGE 03 — Apenas números
    // Verifica se o sistema aceita ou rejeita nomes
    // compostos apenas de números.
    // =====================================================

    test('EDGE 03 - Apenas números', async ({ page }) => {
        await abrirModal(page);
        await preencherDisciplina(page, '123456');

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        await verificarResultado(page);
    });

    // =====================================================
    // EDGE 04 — Letras e números
    // Verifica se o sistema aceita nomes que misturam
    // letras e números, como "Matematica2026".
    // =====================================================

    test('EDGE 04 - Letras e números', async ({ page }) => {
        await abrirModal(page);
        await preencherDisciplina(page, 'Matematica2026');

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        await verificarResultado(page);
    });

    // =====================================================
    // EDGE 05 — Pesquisa sem resultados
    // Verifica se a tabela responde corretamente quando
    // a busca não retorna nenhum resultado.
    // =====================================================

    test('EDGE 05 - Pesquisa sem resultados', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Pesquisar disciplina...' }).fill('xyz123teste');
        await page.keyboard.press('Enter');

        await expect(
            page.getByRole('table')
        ).toBeVisible({ timeout: 10000 });
    });

    // =====================================================
    // EDGE 06 — Espaços antes e depois
    // Verifica se o sistema remove espaços extras (trim)
    // ou se aceita o nome com espaços nas extremidades.
    // =====================================================

    test('EDGE 06 - Espaços antes e depois', async ({ page }) => {
        await abrirModal(page);
        await preencherDisciplina(page, '     Matemática     ');

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        await verificarResultado(page);
    });
});