import { test, expect } from '@playwright/test';
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

    // =====================================================
    // ACESSAR CONTEÚDOS
    // =====================================================

    await page.getByRole('link', {
        name: 'Conteúdos'
    }).click();

    // =====================================================
    // EDGE 1 - Nome com apenas 1 caractere
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('a');

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByText('História').click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 2 - Nome muito grande
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Educação Física'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 3 - Nome com números
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('msaree55778');

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Espanhol'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 4 - Nome com muitos espaços internos
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('gffhnvgcx           fghg');

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Geografia'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 5 - Nome totalmente em maiúsculo
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('SDBVGF');

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Educação Física'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 6 - Nome sem acento / disciplina com acento
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('fisica');

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Física',
        exact: true
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 7 - Nome com caracteres especiais
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('@@!!!');

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Sociologia'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 8 - Pesquisa parcial
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('ev');

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).press('Enter');

    // =====================================================
    // EDGE 9 - Pesquisa com acento
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('evoluç');

    // =====================================================
    // EDGE 10 - Pesquisa em maiúsculo
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('EVOLUÇÃO');
});