import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('CRUD de disciplinas', async ({ page }) => {

    // ===== LOGIN =====
    const secret = '2DINPFKXGBLME2VO';
    const otp = authenticator.generate(secret);

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

    await page.getByRole('textbox', {
        name: /Código de verificação/i
    }).fill(otp);

    await page.getByRole('button', {
        name: /Verificar código/i
    }).click();

    await expect(page).toHaveURL(/dashboard/);

    //await page.pause();
    const nomeDisciplina = `PI-${Date.now()}`;
    const nomeEditado = `PIA-${Date.now()}`;
    
    // ===== ACESSAR DISCIPLINAS =====
    await page.getByRole('button', { 
        name: 'Disciplinas' 
    }).click();

    await page.getByRole('link', {
        name: 'Disciplinas'
    }).click();

    // ===== CREATE =====
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

    // ===== READ =====
    await page.getByRole('textbox', {
        name: 'Pesquisar disciplina...'
    }).fill(nomeDisciplina);

    await expect(
        page.getByText(nomeDisciplina), { exact: true }
    ).toBeVisible();

    // ===== UPDATE =====
    await page.getByRole('button', {
        name: 'Editar'
    }).first().click();

    await page.getByRole('textbox', {
    name: 'Nome da disciplina: *'
    }).fill(nomeEditado);

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // ===== READ APÓS UPDATE =====
    await page.getByRole('textbox', {
        name: 'Pesquisar disciplina...'
    }).fill(nomeEditado);

    await expect(
        page.getByText('PIA')
    ).toBeVisible();

    // ===== DELETE =====
    await page.getByRole('button', {
        name: 'Excluir'
    }).first().click();

    await page.getByRole('button', {
        name: /^Excluir$/
    }).last().click();

});