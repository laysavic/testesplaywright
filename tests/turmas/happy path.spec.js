import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('CRUD de Turmas', async ({ page }) => {

    // =====================================================
    // LOGIN
    // =====================================================

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

    // =====================================================
    // ACESSAR TURMAS
    // =====================================================

    await page.getByRole('link', {
        name: 'Turmas'
    }).click();

    // =====================================================
    // CREATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar nova turma'
    }).click();

    await page.getByRole('button', {
        name: 'Curso'
    }).click();

    await page.getByText(
        'Tecnologia em Análise e Desenvolvimento de Sistemas Atualizado'
    ).click();

    await page.getByRole('textbox', {
        name: 'Ano: *'
    }).fill('2026');

    await page.getByRole('combobox', {
        name: 'Série ou semestre da turma:'
    }).click();

    await page.getByRole('option', {
        name: 'ª Série / 3º Semestre'
    }).click();

    await page.getByRole('combobox', {
        name: 'Turno: campo obrigatório'
    }).click();

    await page.getByLabel('Noturno')
        .getByText('Noturno')
        .click();

    await page.getByRole('textbox', {
        name: 'Sala:'
    }).fill('157');

    await page.getByRole('textbox', {
        name: 'Descrição:'
    }).fill('Turma criada pelo Playwright');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // UPDATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Opções'
    }).first().click();

    await page.getByRole('menuitem', {
        name: 'Editar'
    }).click();

    await page.getByRole('combobox', {
        name: 'Série ou semestre da turma:'
    }).click();

    await page.getByRole('option', {
        name: 'ª Série / 4º Semestre'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // READ
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar turma...'
    }).fill('416');

    // =====================================================
    // DELETE
    // =====================================================

    await page.getByRole('button', {
        name: 'Opções'
    }).first().click();

    await page.getByRole('menuitem', {
        name: 'Excluir'
    }).click();

    await page.getByRole('button', {
        name: 'Excluir'
    }).click();

});