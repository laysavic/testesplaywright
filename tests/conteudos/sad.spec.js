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
}

// =====================================================
// HELPER — acessar conteúdos
// =====================================================

async function abrirConteudos(page) {
    await page.getByRole('button', { name: 'Disciplinas' }).click();
    await page.getByRole('link', { name: 'Conteúdos' }).click();
    await page.waitForLoadState('networkidle');
}

// =====================================================
// HELPER — abrir modal de novo conteúdo
// =====================================================

async function abrirModal(page) {
    const btn = page.getByRole('button', { name: 'Adicionar Conteúdo' });
    await expect(btn).toBeVisible({ timeout: 15000 });
    await btn.click();
    await expect(
        page.getByRole('textbox', { name: 'Nome do conteúdo: *' })
    ).toBeVisible({ timeout: 10000 });
}

// =====================================================
// SAD - Conteúdos
// =====================================================

test.describe('SAD - Conteúdos', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await login(page);
        await abrirConteudos(page);
    });

    // =====================================================
    // SAD 01 — Salvar sem preencher nenhum campo
    // Verifica se o sistema exibe mensagens de erro para
    // os dois campos obrigatórios: nome e disciplina.
    // =====================================================

    test('SAD 01 - Salvar sem preencher nada', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Deve aparecer 2 mensagens de obrigatório (nome + disciplina)
        await expect(
            page.getByText('Este campo é obrigatório')
        ).toHaveCount(2);
    });

    // =====================================================
    // SAD 02 — Salvar com apenas o nome preenchido
    // Verifica se o sistema exige a disciplina mesmo
    // quando o nome já foi informado corretamente.
    // =====================================================

    test('SAD 02 - Informar apenas nome', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: 'Nome do conteúdo: *' }).fill('cones');

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Deve aparecer 1 mensagem de obrigatório (disciplina)
        await expect(
            page.getByText('Este campo é obrigatório')
        ).toHaveCount(1);
    });

    // =====================================================
    // SAD 03 — Salvar com apenas a disciplina preenchida
    // Verifica se o sistema exige o nome mesmo quando
    // a disciplina já foi selecionada corretamente.
    // =====================================================

    test('SAD 03 - Informar apenas disciplina', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('button', { name: 'Disciplina' }).click();
        await page.getByRole('option', { name: 'Espanhol' }).click();

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Deve aparecer 1 mensagem de obrigatório (nome)
        await expect(
            page.getByText('Este campo é obrigatório')
        ).toHaveCount(1);
    });

    // =====================================================
    // SAD 04 — Nome somente com espaços
    // Verifica se o sistema rejeita um nome composto
    // apenas de espaços em branco, que não tem valor real.
    // =====================================================

    test('SAD 04 - Nome somente com espaços', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: 'Nome do conteúdo: *' }).fill('          ');

        await page.getByRole('button', { name: 'Disciplina' }).click();
        await page.getByRole('option', { name: 'Espanhol' }).click();

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar — campo vazio disfarçado
        await expect(
            page.getByRole('button', { name: 'Salvar' })
        ).toBeVisible({ timeout: 5000 });

        await expect(
            page.getByText(/salvo com sucesso/i)
        ).not.toBeVisible();
    });

    // =====================================================
    // SAD 05 — Editar removendo o nome
    // Verifica se o sistema impede salvar um conteúdo
    // existente após apagar o nome no modo de edição.
    // =====================================================

    test('SAD 05 - Editar removendo o nome', async ({ page }) => {
        const nomeTeste = `exe-${Date.now()}`;

        // Cria o conteúdo primeiro
        await abrirModal(page);

        await page.getByRole('textbox', { name: 'Nome do conteúdo: *' }).fill(nomeTeste);

        await page.getByRole('button', { name: 'Disciplina' }).click();
        await page.getByRole('option', { name: 'Educação Física' }).click();

        await page.getByRole('button', { name: 'Salvar' }).click();

        await expect(
            page.getByText(/salvo com sucesso/i)
        ).toBeVisible({ timeout: 10000 });

        // Espera tabela carregar e busca o conteúdo criado
        await expect(page.getByText('Atualizando')).not.toBeVisible({ timeout: 15000 });
        await page.getByRole('textbox', { name: 'Pesquisar conteúdo...' }).fill(nomeTeste);
        await expect(
            page.getByRole('button', { name: 'Editar' }).first()
        ).toBeVisible({ timeout: 10000 });

        // Abre edição e apaga o nome
        await page.getByRole('button', { name: 'Editar' }).first().click();
        await page.getByRole('textbox', { name: 'Nome do conteúdo: *' }).clear();

        await page.getByRole('button', { name: 'Salvar' }).click();

        // ✅ Sistema deve rejeitar — nome obrigatório
        await expect(
            page.getByText('Este campo é obrigatório')
        ).toBeVisible({ timeout: 5000 });
    });

    // =====================================================
    // SAD 06 — Pesquisar conteúdo inexistente
    // Verifica se o sistema exibe a mensagem correta
    // quando nenhum conteúdo é encontrado na busca.
    // =====================================================

    test('SAD 06 - Pesquisar conteúdo inexistente', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Pesquisar conteúdo...' }).fill('exeeeee123456789');
        await page.keyboard.press('Enter');

        // ✅ Sistema deve mostrar mensagem de vazio
        await expect(
            page.getByText(/nenhum conteúdo encontrado/i)
        ).toBeVisible({ timeout: 10000 });
    });

});