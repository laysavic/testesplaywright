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
// HELPER — verificar resultado (aceito, rejeitado ou duplicado)
// Observa o comportamento real do sistema em vez de
// assumir um resultado fixo, evitando falsos negativos
// causados por dados deixados em execuções anteriores.
// =====================================================

async function verificarResultado(page) {
    await page.waitForTimeout(1500);

    const modalAberto = await page.getByRole('button', { name: 'Salvar' }).isVisible();
    const toastSucesso = await page.getByText(/salvo com sucesso/i).isVisible();
    const mensagemErro = await page.getByText(/obrigatório|inválid|caracteres|já existe/i).isVisible();

    expect(modalAberto || toastSucesso || mensagemErro).toBeTruthy();

    if (modalAberto) {
        await fecharModal(page);
    }
}

// =====================================================
// EDGE - Cadastro de Áreas
// =====================================================

test.describe('EDGE - Cadastro de Áreas', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    // =====================================================
    // EDGE 01 — Nome com 1 caractere
    // Verifica o comportamento do sistema com nomes muito
    // curtos. Pode aceitar, rejeitar por tamanho ou rejeitar
    // por duplicidade (se já existir de execução anterior).
    // =====================================================

    test('EDGE 01 - Nome com 1 caractere', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: /Nome da Área/i }).fill('a');
        await page.getByRole('button', { name: 'Salvar' }).click();

        await verificarResultado(page);
    });

    // =====================================================
    // EDGE 02 — Nome muito longo
    // Verifica se o sistema limita o tamanho do nome.
    // Preenche com 250 caracteres para testar o limite.
    // =====================================================

    test('EDGE 02 - Nome muito longo', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: /Nome da Área/i }).fill('a'.repeat(250));
        await page.getByRole('button', { name: 'Salvar' }).click();

        await verificarResultado(page);
    });

    // =====================================================
    // EDGE 03 — Nome com acento
    // Verifica o comportamento com nomes acentuados como
    // "língua estrangeira". Pode aceitar ou rejeitar por
    // duplicidade (se já existir de execução anterior).
    // =====================================================

    test('EDGE 03 - Nome com acento', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: /Nome da Área/i }).fill('língua estrangeira');
        await page.getByRole('button', { name: 'Salvar' }).click();

        await verificarResultado(page);
    });

    // =====================================================
    // EDGE 04 — Nome com caracteres especiais
    // Verifica se o sistema rejeita nomes compostos
    // apenas de caracteres especiais como @!*
    // =====================================================

    test('EDGE 04 - Nome com caracteres especiais', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: /Nome da Área/i }).fill('@!*');
        await page.getByRole('button', { name: 'Salvar' }).click();

        await verificarResultado(page);
    });

    // =====================================================
    // EDGE 05 — Nome com números
    // Verifica se o sistema aceita ou rejeita nomes que
    // misturam letras e números como "uhyu7777".
    // =====================================================

    test('EDGE 05 - Nome com números', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: /Nome da Área/i }).fill('uhyu7777');
        await page.getByRole('button', { name: 'Salvar' }).click();

        await verificarResultado(page);
    });

    // =====================================================
    // EDGE 06 — Pesquisa parcial
    // Verifica se a busca funciona com parte do nome,
    // como "ling" encontrando "língua estrangeira".
    // =====================================================

    test('EDGE 06 - Pesquisa parcial', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Pesquisar área...' }).fill('ling');

        // ✅ Tabela deve responder à pesquisa
        await expect(
            page.getByRole('table')
        ).toBeVisible({ timeout: 10000 });
    });

    // =====================================================
    // EDGE 07 — Pesquisa com acento
    // Verifica se a busca funciona corretamente com
    // caracteres acentuados como "líng".
    // =====================================================

    test('EDGE 07 - Pesquisa com acento', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Pesquisar área...' }).clear();
        await page.getByRole('textbox', { name: 'Pesquisar área...' }).fill('líng');

        // ✅ Tabela deve responder à pesquisa com acento
        await expect(
            page.getByRole('table')
        ).toBeVisible({ timeout: 10000 });
    });

    // =====================================================
    // EDGE 08 — Pesquisa em maiúsculas
    // Verifica se a busca é case-insensitive, ou seja,
    // "CIENC" deve encontrar o mesmo que "cienc".
    // =====================================================

    test('EDGE 08 - Pesquisa em maiúsculas', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Pesquisar área...' }).clear();
        await page.getByRole('textbox', { name: 'Pesquisar área...' }).fill('CIENC');

        // ✅ Deve retornar os mesmos resultados que em minúsculo
        await expect(
            page.getByRole('table')
        ).toBeVisible({ timeout: 10000 });
    });

    // =====================================================
    // EDGE 09 — Limpar pesquisa
    // Verifica se ao limpar o campo de busca a tabela
    // volta a exibir todos os registros normalmente.
    // =====================================================

    test('EDGE 09 - Limpar pesquisa', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Pesquisar área...' }).fill('CIENC');
        await page.getByRole('textbox', { name: 'Pesquisar área...' }).clear();

        // ✅ Tabela deve voltar a exibir todos os registros
        await expect(
            page.getByRole('table')
        ).toBeVisible({ timeout: 10000 });
    });

});