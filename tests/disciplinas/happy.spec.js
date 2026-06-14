import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('CRUD de disciplinas', async ({ page }) => {

    // =====================================================
    // LOGIN
    // =====================================================

    const secret = 'HXEVA6OMYITVPBS2';

    await page.goto('https://app.avaliei.com.br/login');

    await page.getByRole('textbox', {
        name: 'Email'
    }).fill('e2e-super-teacher-23@example.com');

    await page.getByRole('textbox', {
        name: 'Senha'
    }).fill('password');

    await page.getByRole('button', {
        name: 'Entrar'
    }).click();

    await page.waitForURL(/2fa-codigo/);

    const otp = authenticator.generate(secret);
    const timeRemaining = authenticator.timeRemaining();

    if (timeRemaining <= 5) {
        await page.waitForTimeout((timeRemaining + 1) * 1000);

        const freshOtp = authenticator.generate(secret);

        await page.getByRole('textbox', {
            name: /Código de verificação/i
        }).fill(freshOtp);
    } else {
        await page.getByRole('textbox', {
            name: /Código de verificação/i
        }).fill(otp);
    }

    await page.getByRole('button', {
        name: /Verificar código/i
    }).click();

    await expect(page).toHaveURL(/dashboard/, {
        timeout: 15000
    });

    // =====================================================
    // DADOS
    // =====================================================

    const nomeDisciplina = `PI-${Date.now()}`;
    const nomeEditado = `PIA-${Date.now()}`;

    // =====================================================
    // ACESSAR DISCIPLINAS
    // =====================================================

    await page.getByRole('button', {
        name: 'Disciplinas'
    }).click();

    await page.getByRole('link', {
        name: 'Disciplinas'
    }).click();

    await page.waitForLoadState('networkidle');

    // =====================================================
    // CREATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar disciplina'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da disciplina: *'
    }).fill(nomeDisciplina);

    await page.getByRole('button', {
        name: 'Selecione a área da disciplina'
    }).click();

    await page.getByLabel('Suggestions')
        .getByText('Linguagens, códigos e suas')
        .click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await expect(
        page.getByText(/Disciplina salva com sucesso/i)
    ).toBeVisible({
        timeout: 10000
    });

    // =====================================================
    // READ
    // =====================================================

    await expect(
        page.getByText('Atualizando')
    ).not.toBeVisible({
        timeout: 15000
    });

    await page.getByRole('textbox', {
        name: 'Pesquisar disciplina...'
    }).fill(nomeDisciplina);

    await expect(
        page.getByText(nomeDisciplina, { exact: true })
    ).toBeVisible({
        timeout: 10000
    });

    // =====================================================
    // UPDATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Editar'
    }).first().click();

    await page.waitForLoadState('networkidle');

    await page.getByRole('textbox', {
        name: 'Nome da disciplina: *'
    }).clear();

    await page.getByRole('textbox', {
        name: 'Nome da disciplina: *'
    }).fill(nomeEditado);

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await expect(
        page.getByText(/Disciplina salva com sucesso/i)
    ).toBeVisible({
        timeout: 10000
    });

    // =====================================================
    // READ APÓS UPDATE
    // =====================================================

    await expect(
        page.getByText('Atualizando')
    ).not.toBeVisible({
        timeout: 15000
    });

    await page.getByRole('textbox', {
        name: 'Pesquisar disciplina...'
    }).clear();

    await page.getByRole('textbox', {
        name: 'Pesquisar disciplina...'
    }).fill(nomeEditado);

    await expect(
        page.getByText(nomeEditado)
    ).toBeVisible({
        timeout: 10000
    });

    // =====================================================
    // DELETE
    // =====================================================

    await page.getByRole('button', {
        name: 'Excluir'
    }).first().click();

    await expect(
        page.getByRole('button', {
            name: /^Excluir$/
        }).last()
    ).toBeVisible({
        timeout: 10000
    });

    await page.getByRole('button', {
        name: /^Excluir$/
    }).last().click();

    await expect(
        page.getByText(/Disciplina excluída com sucesso/i)
    ).toBeVisible({
        timeout: 10000
    });

});