import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('HAPPY - CRUD de Turmas', async ({ page }) => {

    // =====================================================
    // LOGIN
    // =====================================================

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
    const timeRemaining = authenticator.timeRemaining();
    if (timeRemaining <= 10) {
        await page.waitForTimeout((timeRemaining + 1) * 1000);
    }
    const otp = authenticator.generate(secret);
    await page.getByRole('textbox', { name: /Código de verificação/i }).fill(otp);
    await page.getByRole('button', { name: /Verificar código/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 30000 });

    // =====================================================
    // ACESSAR TURMAS
    // =====================================================

    await page.getByRole('button', { name: /Turmas/i }).click();
    await page.getByRole('link', { name: 'Turmas' }).click();
    await page.waitForLoadState('networkidle');

    // =====================================================
    // CREATE
    // =====================================================

    const sala = `${Date.now()}`;

    await page.getByRole('button', { name: 'Adicionar nova turma' }).click();

    await expect(
        page.getByRole('textbox', { name: 'Ano: *' })
    ).toBeVisible({ timeout: 10000 });

    // ✅ Seleciona curso via Suggestions (conforme gravado)
    await page.getByRole('button', { name: 'Curso' }).click();
    await expect(
        page.getByLabel('Suggestions').getByText('Letras - Espanhol')
    ).toBeVisible({ timeout: 10000 });
    await page.getByLabel('Suggestions').getByText('Letras - Espanhol').click();

    await page.getByRole('textbox', { name: 'Ano: *' }).fill('2026');

    await page.getByRole('combobox', { name: 'Série ou semestre da turma:' }).click();
    await page.getByRole('option', { name: 'ª Série / 3º Semestre' }).click({ force: true });

    // ✅ Turno via option em vez de ID dinâmico
    await page.getByRole('combobox', { name: 'Turno: campo obrigatório' }).click();
    await page.getByRole('option', { name: 'Noturno' }).click({ force: true });

    await page.getByRole('textbox', { name: 'Sala:' }).fill(sala);
    await page.getByRole('textbox', { name: 'Descrição:' }).fill('exemplos');

    await page.getByRole('button', { name: 'Salvar' }).click();

    // ✅ Confirma que salvou com sucesso
    await expect(
        page.getByText(/Turma salva com sucesso/i)
    ).toBeVisible({ timeout: 10000 });

    // =====================================================
    // READ após CREATE
    // =====================================================

    // ✅ Confirma que a turma aparece na tabela
    await expect(
        page.getByText('Atualizando')
    ).not.toBeVisible({ timeout: 15000 });
    await expect(
        page.getByRole('button', { name: 'Opções' }).first()
    ).toBeVisible({ timeout: 15000 });

    // =====================================================
    // UPDATE
    // =====================================================

    await page.getByRole('button', { name: 'Opções' }).first().click();
    await page.getByRole('menuitem', { name: 'Editar' }).click();

    await expect(
        page.getByRole('combobox', { name: 'Turno: campo obrigatório' })
    ).toBeVisible({ timeout: 10000 });

    // ✅ Espera animação do modal
    await page.waitForTimeout(400);

    await page.getByRole('combobox', { name: 'Turno: campo obrigatório' }).click();
    await page.getByRole('option', { name: 'Vespertino' }).click({ force: true });

    await page.getByRole('button', { name: 'Salvar' }).click();

    // ✅ Confirma que o modal fechou (sucesso)
    await expect(
        page.getByRole('combobox', { name: 'Turno: campo obrigatório' })
    ).not.toBeVisible({ timeout: 10000 });

    // =====================================================
    // READ após UPDATE
    // =====================================================

    await expect(
        page.getByText('Atualizando')
    ).not.toBeVisible({ timeout: 15000 });

    await expect(
        page.getByRole('button', { name: 'Opções' }).first()
    ).toBeVisible({ timeout: 15000 });

    // =====================================================
    // DELETE
    // =====================================================

    await page.getByRole('button', { name: 'Opções' }).first().click();
    await page.getByRole('menuitem', { name: 'Excluir' }).click();

    await expect(
        page.getByRole('button', { name: 'Excluir' })
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Excluir' }).click();

    // ✅ Confirma que foi deletado
    await expect(
        page.getByText('Atualizando')
    ).not.toBeVisible({ timeout: 15000 });

});