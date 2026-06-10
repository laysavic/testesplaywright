import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('CRUD de Conteúdos', async ({ page }) => {

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

    await expect(page).toHaveURL(/dashboard/);

    const nomeConteudo = `Conteudo-${Date.now()}`;
    const nomeEditado = `ConteudoEditado-${Date.now()}`;

    // =====================================================
    // ACESSAR CONTEÚDOS
    // =====================================================

    await page.getByRole('button', {
        name: 'Disciplinas'
    }).click();

    await page.getByRole('link', {
        name: 'Conteúdos'
    }).click();

    // =====================================================
    // CREATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill(nomeConteudo);

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByPlaceholder(
        'Pesquisar disciplina...'
    ).fill('Mat');

    await page.getByRole('option', {
        name: 'Matemática'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // READ
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill(nomeConteudo);

    await expect(
        page.getByText(nomeConteudo)
    ).toBeVisible();

    // =====================================================
    // UPDATE
    // =====================================================

    await page.getByRole('button', {
        name: 'Editar'
    }).first().click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill(nomeEditado);

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // READ APÓS UPDATE
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill(nomeEditado);

    await expect(
        page.getByText(nomeEditado)
    ).toBeVisible();

    // =====================================================
    // DELETE
    // =====================================================

    await page.getByRole('button', {
        name: 'Excluir'
    }).first().click();

    await page.getByRole('button', {
        name: /^Excluir$/
    }).last().click();
});