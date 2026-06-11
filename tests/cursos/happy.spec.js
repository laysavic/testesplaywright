import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('CRUD de cursos', async ({ page }) => {

    // =====================================================
    // LOGIN
    // =====================================================

    const secret = '2DINPFKXGBLME2VO';

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

    const nomeCurso = `CURSO-${Date.now()}`;
    const nomeEditado = `CURSO-EDIT-${Date.now()}`;

    // =====================================================
    // ACESSAR CURSOS
    // =====================================================

    await page.getByRole('button', {
        name: 'Turmas'
    }).click();

    await page.getByRole('link', {
        name: 'Cursos'
    }).click();

    await page.waitForLoadState('networkidle');

    // =====================================================
    // CREATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Curso'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do Curso: *'
    }).fill(nomeCurso);

    await page.getByRole('button', {
        name: 'Nível de Escolaridade'
    }).click();

    await page.getByRole('option', {
        name: 'Médio'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // Confirma salvamento
    await expect(
        page.getByText(/Curso salvo com sucesso/i)
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
        name: /Pesquisar/i
    }).fill(nomeCurso);

    await expect(
        page.getByText(nomeCurso)
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
        name: 'Nome do Curso: *'
    }).clear();

    await page.getByRole('textbox', {
        name: 'Nome do Curso: *'
    }).fill(nomeEditado);

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await expect(
        page.getByText(/Curso salvo com sucesso/i)
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
        name: /Pesquisar/i
    }).clear();

    await page.getByRole('textbox', {
        name: /Pesquisar/i
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
        page.getByText(/Curso excluído com sucesso/i)
    ).toBeVisible({
        timeout: 10000
    });

});