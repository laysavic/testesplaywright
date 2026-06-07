import { test } from '@playwright/test';
import { authenticator } from 'otplib';

test('EDGE - Cadastro de Cursos', async ({ page }) => {

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

    await page.getByRole('link', {
        name: 'Cursos'
    }).click();

    // =====================================================
    // EDGE 1 - Nome com 1 caractere
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Curso'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do Curso: *'
    }).fill('a');

    await page.getByRole('button', {
        name: 'Nível de Escolaridade'
    }).click();

    await page.getByRole('option', {
        name: 'Fundamental'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 2 - Nome muito longo
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Curso'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do Curso: *'
    }).fill(
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaassssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss'
    );

    await page.getByRole('button', {
        name: 'Nível de Escolaridade'
    }).click();

    await page.getByRole('option', {
        name: 'Fundamental'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 3 - Nome com números
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Curso'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do Curso: *'
    }).fill('xfgfd666667777777');

    await page.getByRole('button', {
        name: 'Nível de Escolaridade'
    }).click();

    await page.getByRole('option', {
        name: 'Médio'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 4 - Nome com muitos espaços internos
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Curso'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do Curso: *'
    }).fill('cccccccccccccc               ggggggggggggg');

    await page.getByRole('button', {
        name: 'Nível de Escolaridade'
    }).click();

    await page.getByRole('option', {
        name: 'Fundamental'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 5 - Nome totalmente em maiúsculo
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Curso'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do Curso: *'
    }).fill('HHHBHBHVGVGU');

    await page.getByRole('button', {
        name: 'Nível de Escolaridade'
    }).click();

    await page.getByRole('option', {
        name: 'Fundamental'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 6 - Pesquisa parcial
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar curso...'
    }).fill('curs');

    await page.keyboard.press('Enter');

    // =====================================================
    // EDGE 7 - Pesquisa com acento
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar curso...'
    }).fill('líng');

    // =====================================================
    // EDGE 8 - Limpar pesquisa
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar curso...'
    }).fill('');
});