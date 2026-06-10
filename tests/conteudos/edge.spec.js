import { test } from '@playwright/test';
import { authenticator } from 'otplib';

test('EDGE - Conteúdos', async ({ page }) => {

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

    // Aguarda carregar o dashboard
    await page.waitForURL(/dashboard/);

    // =====================================================
    // ACESSAR CONTEÚDOS
    // =====================================================

    await page.getByRole('button', {
        name: 'Disciplinas'
    }).click();

    await page.getByRole('link', {
        name: 'Conteúdos'
    }).click();

    // Aguarda a tela carregar
    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).waitFor();

    // =====================================================
    // Helper para selecionar disciplina
    // =====================================================

    async function selecionarDisciplina() {

        await page.locator('#content-disciplina').click();

        await page.getByPlaceholder(
            'Pesquisar disciplina...'
        ).fill('mat');

        await page.getByText(
            'Matemática',
            { exact: true }
        ).click();
    }

    // =====================================================
    // EDGE 01
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('a');

    await selecionarDisciplina();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');

    // =====================================================
    // EDGE 02
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('A'.repeat(250));

    await selecionarDisciplina();

    await page.pause();
    
    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');

    // =====================================================
    // EDGE 03
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('conteudo123456');

    await selecionarDisciplina();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');

    // =====================================================
    // EDGE 04
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('conteudo      com      espacos');

    await selecionarDisciplina();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');

    // =====================================================
    // EDGE 05
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('CONTEUDO TESTE');

    await selecionarDisciplina();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');

    // =====================================================
    // EDGE 06
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('@#!$%¨&*');

    await selecionarDisciplina();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');

    // =====================================================
    // EDGE 07
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('pri');

    // =====================================================
    // EDGE 08
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('');

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('evoluç');

    // =====================================================
    // EDGE 09
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('');

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('EVOLUÇÃO');

});