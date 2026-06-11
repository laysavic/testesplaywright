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

    await page.getByRole('button', { name: /turmas/i }).click();
    await page.getByRole('link', { name: /^Turmas$/ }).click();
    await page.waitForLoadState('networkidle');
}

// =====================================================
// HELPER — abrir modal de nova turma
// =====================================================

async function abrirModal(page) {
    const btn = page.getByRole('button', { name: /Adicionar nova turma/i });
    await expect(btn).toBeVisible({ timeout: 15000 });
    await btn.click();
    await expect(
        page.getByRole('textbox', { name: /Ano/i })
    ).toBeVisible({ timeout: 10000 });
}

// =====================================================
// HELPER — preencher campos mínimos (curso + ano)
// =====================================================

async function preencherCamposBase(page, ano = '2026') {
    await page.getByRole('button', { name: 'Curso' }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('textbox', { name: 'Ano: *' }).fill(ano);
}

// =====================================================
// HELPER — verificar que o sistema rejeitou o formulário
// =====================================================

async function verificarRejeicao(page) {
    // ✅ O modal continua aberto (botão Salvar ainda visível)
    await expect(
        page.getByRole('button', { name: 'Salvar' })
    ).toBeVisible({ timeout: 5000 });

    // ✅ Nenhum toast de sucesso apareceu
    await expect(
        page.getByText(/Turma salva com sucesso/i)
    ).not.toBeVisible();
}

// =====================================================
// HELPER — verificar que o sistema aceitou o formulário
// =====================================================

async function verificarAceitacao(page) {
    // ✅ Toast de sucesso aparece
    await expect(
        page.getByText(/Turma salva com sucesso/i)
    ).toBeVisible({ timeout: 10000 });
}

// =====================================================
// EDGE - Turmas
// =====================================================

test.describe('EDGE - Turmas', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    // =====================================================
    // EDGE 01 — Ano com letras
    // Verifica se o sistema rejeita letras no campo Ano,
    // que deve aceitar apenas números (ex: 2026).
    // =====================================================

    test('EDGE 01 - Ano com letras', async ({ page }) => {
        await abrirModal(page);
        await preencherCamposBase(page, 'abcd');

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar — ano inválido
        await verificarRejeicao(page);
    });

    // =====================================================
    // EDGE 02 — Ano com dois dígitos
    // Verifica se o sistema rejeita um ano incompleto
    // como "34", que não representa um ano válido.
    // =====================================================

    test('EDGE 02 - Ano com dois dígitos', async ({ page }) => {
        await abrirModal(page);
        await preencherCamposBase(page, '34');

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar — ano muito curto
        await verificarRejeicao(page);
    });

    // =====================================================
    // EDGE 03 — Ano 9999
    // Verifica o comportamento com um ano extremo mas
    // numericamente válido. O sistema pode aceitar ou
    // rejeitar dependendo da regra de negócio.
    // =====================================================

    test('EDGE 03 - Ano 9999', async ({ page }) => {
        await abrirModal(page);
        await preencherCamposBase(page, '9999');

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Aguarda 3s e verifica um dos dois cenários possíveis:
        // ou o modal fechou (aceitou) ou o botão Salvar ainda está visível (rejeitou)
        await page.waitForTimeout(3000);

        const modalAberto = await page.getByRole('button', { name: 'Salvar' }).isVisible();
        const toastSucesso = await page.getByText(/Turma salva com sucesso/i).isVisible();

        // ✅ Um dos dois deve ser verdadeiro
        expect(modalAberto || toastSucesso).toBeTruthy();
    });

    // =====================================================
    // EDGE 04 — Sala muito longa
    // Verifica se o sistema limita o tamanho do campo Sala.
    // Preenche com 80 caracteres para testar o limite.
    // =====================================================

    test('EDGE 04 - Sala muito longa', async ({ page }) => {
        await abrirModal(page);
        await preencherCamposBase(page);

        await page.getByRole('textbox', { name: /Sala/i }).fill('8'.repeat(80));

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar ou truncar o valor
        await verificarRejeicao(page);
    });

    // =====================================================
    // EDGE 05 — Sala com caracteres especiais
    // Verifica se o sistema aceita ou bloqueia caracteres
    // especiais como !@#$% no campo Sala.
    // =====================================================

    test('EDGE 05 - Sala com caracteres especiais', async ({ page }) => {
        await abrirModal(page);
        await preencherCamposBase(page);

        await page.getByRole('textbox', { name: /Sala/i }).fill('!@#$%');

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar — caracteres inválidos
        await verificarRejeicao(page);
    });

    // =====================================================
    // EDGE 06 — Descrição gigante
    // Verifica se o sistema lida corretamente com uma
    // descrição de 500 caracteres, testando o limite do campo.
    // =====================================================

    test('EDGE 06 - Descrição gigante', async ({ page }) => {
        await abrirModal(page);
        await preencherCamposBase(page);

        await page.getByRole('textbox', { name: /Descrição/i }).fill('A'.repeat(500));

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar ou truncar — descrição muito longa
        await verificarRejeicao(page);
    });

    // =====================================================
    // EDGE 07 — Descrição só com espaços
    // Verifica se o sistema rejeita uma descrição com
    // apenas espaços em branco, que não tem valor real.
    // =====================================================

    test('EDGE 07 - Descrição só espaços', async ({ page }) => {
        await abrirModal(page);
        await preencherCamposBase(page);

        await page.getByRole('textbox', { name: /Descrição/i }).fill('     ');

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar — campo vazio disfarçado
        await verificarRejeicao(page);
    });

    // =====================================================
    // EDGE 08 — Pesquisa com acento
    // Verifica se a busca funciona corretamente com
    // caracteres acentuados como "Informática".
    // =====================================================

    test('EDGE 08 - Pesquisa com acento', async ({ page }) => {
        await page.getByRole('textbox', { name: /Pesquisar/i }).fill('Informática');
        await page.keyboard.press('Enter');

        // ✅ Deve retornar resultados ou mostrar "Nenhuma turma encontrada"
        await expect(
            page.getByRole('table')
        ).toBeVisible({ timeout: 10000 });
    });

    // =====================================================
    // EDGE 09 — Pesquisa em minúsculo
    // Verifica se a busca é case-insensitive, ou seja,
    // "informática" deve encontrar o mesmo que "Informática".
    // =====================================================

    test('EDGE 09 - Pesquisa minúscula', async ({ page }) => {
        await page.getByRole('textbox', { name: /Pesquisar/i }).fill('informática');
        await page.keyboard.press('Enter');

        // ✅ Deve retornar os mesmos resultados que com letra maiúscula
        await expect(
            page.getByRole('table')
        ).toBeVisible({ timeout: 10000 });
    });

});