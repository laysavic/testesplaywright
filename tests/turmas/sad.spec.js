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
    const timeRemaining = authenticator.timeRemaining();
    if (timeRemaining <= 10) {
        await page.waitForTimeout((timeRemaining + 1) * 1000);
    }
    const otp = authenticator.generate(secret);
    await page.getByRole('textbox', { name: /Código de verificação/i }).fill(otp);
    await page.getByRole('button', { name: /Verificar código/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 30000 });

    await page.getByRole('button', { name: /Turmas/i }).click();
    await page.getByRole('link', { name: 'Turmas' }).click();
    await page.waitForLoadState('networkidle');
}

// =====================================================
// HELPER — abrir modal de nova turma
// =====================================================

async function abrirModal(page) {
    const btn = page.getByRole('button', { name: 'Adicionar nova turma' });
    await expect(btn).toBeVisible({ timeout: 15000 });
    await btn.click();

    await expect(
        page.getByRole('textbox', { name: 'Ano: *' })
    ).toBeVisible({ timeout: 10000 });

    // ✅ Espera animação do modal terminar
    await page.waitForTimeout(400);
}

// =====================================================
// HELPER — fechar modal
// =====================================================

async function fecharModal(page) {
    await page.keyboard.press('Escape');
    await expect(
        page.getByRole('button', { name: 'Adicionar nova turma' })
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
        page.getByText(/Turma salva com sucesso/i)
    ).not.toBeVisible();
}

// =====================================================
// SAD - Turmas
// =====================================================

test.describe('SAD - Turmas', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    // =====================================================
    // SAD 01 — Salvar sem preencher nenhum campo
    // Verifica se o sistema exibe mensagens de erro para
    // todos os campos obrigatórios vazios.
    // =====================================================

    test('SAD 01 - Salvar sem preencher nenhum campo', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        // ✅ Sistema deve rejeitar — campos obrigatórios vazios
        await verificarRejeicao(page);
        await fecharModal(page);
    });

    // =====================================================
    // SAD 02 — Salvar sem curso
    // Verifica se o sistema exige a seleção do curso
    // mesmo quando os outros campos estão preenchidos.
    // =====================================================

    test('SAD 02 - Salvar sem curso', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('textbox', { name: 'Ano: *' }).fill('2026');

        await page.getByRole('combobox', { name: 'Série ou semestre da turma:' }).click();
        await page.getByRole('option', { name: 'ª Série / 3º Semestre' }).click({ force: true });

        await page.getByRole('combobox', { name: 'Turno: campo obrigatório' }).click();
        await page.getByRole('option', { name: 'Vespertino' }).click({ force: true });

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        // ✅ Sistema deve rejeitar — curso obrigatório
        await verificarRejeicao(page);
        await fecharModal(page);
    });

    // =====================================================
    // SAD 03 — Salvar sem ano
    // Verifica se o sistema exige o ano mesmo quando
    // os outros campos estão preenchidos corretamente.
    // =====================================================

    test('SAD 03 - Salvar sem ano', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('button', { name: 'Curso' }).click();
        await expect(
            page.getByLabel('Suggestions').getByText('Letras - Espanhol')
        ).toBeVisible({ timeout: 10000 });
        await page.getByLabel('Suggestions').getByText('Letras - Espanhol').click();

        await page.getByRole('combobox', { name: 'Série ou semestre da turma:' }).click();
        await page.getByRole('option', { name: 'ª Série / 3º Semestre' }).click({ force: true });

        await page.getByRole('combobox', { name: 'Turno: campo obrigatório' }).click();
        await page.getByRole('option', { name: 'Vespertino' }).click({ force: true });

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        // ✅ Sistema deve rejeitar — ano obrigatório
        await verificarRejeicao(page);
        await fecharModal(page);
    });

    // =====================================================
    // SAD 04 — Salvar sem série ou semestre
    // Verifica se o sistema exige a série/semestre mesmo
    // quando os outros campos estão preenchidos.
    // =====================================================

    test('SAD 04 - Salvar sem série ou semestre', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('button', { name: 'Curso' }).click();
        await expect(
            page.getByLabel('Suggestions').getByText('Letras - Espanhol')
        ).toBeVisible({ timeout: 10000 });
        await page.getByLabel('Suggestions').getByText('Letras - Espanhol').click();

        await page.getByRole('textbox', { name: 'Ano: *' }).fill('2026');

        await page.getByRole('combobox', { name: 'Turno: campo obrigatório' }).click();
        await page.getByRole('option', { name: 'Vespertino' }).click({ force: true });

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        // ✅ Sistema deve rejeitar — série/semestre obrigatório
        await verificarRejeicao(page);
        await fecharModal(page);
    });

    // =====================================================
    // SAD 05 — Salvar sem turno
    // Verifica se o sistema exige o turno mesmo quando
    // os outros campos estão preenchidos.
    // =====================================================

    test('SAD 05 - Salvar sem turno', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('button', { name: 'Curso' }).click();
        await expect(
            page.getByLabel('Suggestions').getByText('Letras - Espanhol')
        ).toBeVisible({ timeout: 10000 });
        await page.getByLabel('Suggestions').getByText('Letras - Espanhol').click();

        await page.getByRole('textbox', { name: 'Ano: *' }).fill('2026');

        await page.getByRole('combobox', { name: 'Série ou semestre da turma:' }).click();
        await page.getByRole('option', { name: 'ª Série / 3º Semestre' }).click({ force: true });

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        // ✅ Sistema deve rejeitar — turno obrigatório
        await verificarRejeicao(page);
        await fecharModal(page);
    });

    // =====================================================
    // SAD 06 — Criar turma duplicada
    // Verifica se o sistema impede o cadastro de uma
    // turma com as mesmas características já existente.
    // =====================================================

    test('SAD 06 - Criar turma duplicada', async ({ page }) => {
        await abrirModal(page);

        await page.getByRole('button', { name: 'Curso' }).click();
        await expect(
            page.getByLabel('Suggestions').getByText('Letras - Espanhol')
        ).toBeVisible({ timeout: 10000 });
        await page.getByLabel('Suggestions').getByText('Letras - Espanhol').click();

        await page.getByRole('textbox', { name: 'Ano: *' }).fill('2026');

        await page.getByRole('combobox', { name: 'Série ou semestre da turma:' }).click();
        await page.getByRole('option', { name: 'ª Série / 3º Semestre' }).click({ force: true });

        await page.getByRole('combobox', { name: 'Turno: campo obrigatório' }).click();
        await page.getByRole('option', { name: 'Vespertino' }).click({ force: true });

        await page.getByRole('textbox', { name: 'Sala:' }).fill('1234');

        await page.getByRole('button', { name: 'Salvar' }).click({ force: true });

        // ✅ Sistema deve rejeitar — turma duplicada
        await expect(
            page.getByText(/Já existe uma turma/i)
        ).toBeVisible({ timeout: 10000 });

        await fecharModal(page);
    });

    // =====================================================
    // SAD 07 — Pesquisar turma inexistente
    // Verifica se o sistema exibe mensagem adequada
    // quando nenhuma turma é encontrada na busca.
    // =====================================================

    test('SAD 07 - Pesquisar turma inexistente', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Pesquisar turma...' }).fill('xyzturma999999');

        // ✅ Sistema deve mostrar tabela vazia
        await expect(
            page.getByText(/Nenhuma turma encontrada/i)
        ).toBeVisible({ timeout: 10000 });
    });

});