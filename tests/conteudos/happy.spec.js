import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('CRUD de Conteúdos', async ({ page }) => {

    // =====================================================
    // LOGIN
    // =====================================================

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
    await expect(page).toHaveURL(/dashboard/, { timeout: 20000 });

    const nomeConteudo = `Conteudo-${Date.now()}`;
    const nomeEditado = `ConteudoEditado-${Date.now()}`;

    // =====================================================
    // ACESSAR CONTEÚDOS
    // =====================================================

    await page.getByRole('button', { name: 'Disciplinas' }).click();
    await page.getByRole('link', { name: 'Conteúdos' }).click();
    await page.waitForLoadState('networkidle');

    // =====================================================
    // CREATE
    // =====================================================

    await page.getByRole('button', { name: 'Adicionar Conteúdo' }).click();

    await page.getByRole('textbox', { name: 'Nome do conteúdo: *' }).fill(nomeConteudo);

    await page.getByRole('button', { name: 'Disciplina' }).click();
    await page.getByPlaceholder('Pesquisar disciplina...').fill('Mat');
    await page.getByRole('option', { name: 'Matemática' }).click();

    await page.getByRole('button', { name: 'Salvar' }).click();

    // ✅ Confirma que salvou com sucesso
    await expect(
        page.getByText(/salvo com sucesso/i)
    ).toBeVisible({ timeout: 10000 });

    // =====================================================
    // READ após CREATE
    // =====================================================

    // ✅ Espera tabela carregar antes de pesquisar
    await expect(page.getByText('Atualizando')).not.toBeVisible({ timeout: 15000 });

    await page.getByRole('textbox', { name: 'Pesquisar conteúdo...' }).fill(nomeConteudo);
    await expect(
        page.getByText(nomeConteudo).first()
    ).toBeVisible({ timeout: 10000 });

    // =====================================================
    // UPDATE
    // =====================================================

    await expect(
        page.getByRole('button', { name: 'Editar' }).first()
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Editar' }).first().click();

    await page.getByRole('textbox', { name: 'Nome do conteúdo: *' }).clear();
    await page.getByRole('textbox', { name: 'Nome do conteúdo: *' }).fill(nomeEditado);

    await page.getByRole('button', { name: 'Salvar' }).click();

    // ✅ Confirma que atualizou com sucesso
    await expect(
        page.getByText(/salvo com sucesso/i)
    ).toBeVisible({ timeout: 10000 });

    // =====================================================
    // READ após UPDATE
    // =====================================================

    // ✅ Espera tabela recarregar
    await expect(page.getByText('Atualizando')).not.toBeVisible({ timeout: 15000 });

    await page.getByRole('textbox', { name: 'Pesquisar conteúdo...' }).clear();
    await page.getByRole('textbox', { name: 'Pesquisar conteúdo...' }).fill(nomeEditado);
    await expect(
        page.getByText(nomeEditado).first()
    ).toBeVisible({ timeout: 10000 });

    // =====================================================
    // DELETE
    // =====================================================

    await expect(
        page.getByRole('button', { name: 'Excluir' }).first()
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Excluir' }).first().click();

    // ✅ Confirma o modal de exclusão e clica em Excluir
    await expect(
        page.getByRole('button', { name: /^Excluir$/ }).last()
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /^Excluir$/ }).last().click();

    // ✅ Confirma que foi deletado
    await expect(
        page.getByText(/excluído com sucesso/i)
    ).toBeVisible({ timeout: 10000 });

});