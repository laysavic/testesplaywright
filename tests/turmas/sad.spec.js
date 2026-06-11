import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('SAD-CRUD de Turmas', async ({ page }) => {

    // =====================================================
    // LOGIN
    // =====================================================

    const secret = '2DINPFKXGBLME2VO';

    await page.goto('https://app.avaliei.com.br/login');

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
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

    // =====================================================
    // ACESSAR TURMAS
    // =====================================================

    await page.getByRole('button', { name: /Turmas/i }).click();
    await page.getByRole('link', { name: 'Turmas' }).click();
    await page.waitForLoadState('networkidle');

    // =====================================================
    // CREATE
    // =====================================================

    const ano = '2027';
    const anoEditado = '2028';
    const sala = `${Date.now()}`;

    await page.getByRole('button', { name: 'Adicionar nova turma' }).click();

    await page.getByRole('button', { name: 'Curso' }).click();
    await page.getByRole('option', { name: 'Informáticaaaa' }).click();

    await page.getByRole('textbox', { name: 'Ano: *' }).fill(ano);

    await page.getByRole('combobox', { name: 'Série ou semestre da turma:' }).click();
    await page.getByRole('option', { name: 'ª Série / 3º Semestre' }).click({ force: true });

    await page.getByRole('combobox', { name: 'Turno: campo obrigatório' }).click();
    await page.getByRole('option', { name: 'Vespertino' }).click({ force: true });

    await page.getByRole('textbox', { name: 'Sala:' }).fill(sala);
    await page.getByRole('textbox', { name: 'Descrição:' }).fill('Turma criada pelo Playwright');

    await page.getByRole('button', { name: 'Salvar' }).click();

    // ✅ Confirma que salvou com sucesso
    await expect(page.getByText(/Turma salva com sucesso/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Já existe uma turma/i)).not.toBeVisible();

    // =====================================================
    // READ após CREATE
    // =====================================================

    // ✅ Espera "Atualizando..." sumir e tabela carregar
    await expect(page.getByText('Atualizando')).not.toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Opções' }).first()).toBeVisible({ timeout: 15000 });

    // =====================================================
    // UPDATE
    // =====================================================

    await page.getByRole('button', { name: 'Opções' }).first().click();
    await page.locator('[data-slot="dropdown-menu-item"]').filter({ hasText: 'Editar' }).first().click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('textbox', { name: 'Ano: *' }).clear();
    await page.getByRole('textbox', { name: 'Ano: *' }).fill(anoEditado);

    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText(/Turma salva com sucesso/i)).toBeVisible({ timeout: 10000 });

    // =====================================================
    // READ após UPDATE
    // =====================================================

    // ✅ Espera tabela recarregar
    await expect(page.getByText('Atualizando')).not.toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Opções' }).first()).toBeVisible({ timeout: 15000 });

    // =====================================================
    // DELETE
    // =====================================================

    await page.getByRole('button', { name: 'Opções' }).first().click();
    await page.locator('[data-slot="dropdown-menu-item"]').filter({ hasText: 'Excluir' }).first().click();

    await expect(page.getByRole('button', { name: 'Excluir' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Excluir' }).click();

    await expect(page.getByText(/Turma excluída com sucesso/i)).toBeVisible({ timeout: 10000 });

});