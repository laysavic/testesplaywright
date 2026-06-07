import { test } from '@playwright/test';
import { authenticator } from 'otplib';

test('SAD - Cadastro de Conteúdos', async ({ page }) => {

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
    // SAD 1 - Salvar sem preencher nada
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.getByRole('button', {
        name: 'Close'
    }).click();

    // =====================================================
    // SAD 2 - Informar apenas o nome
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('cones');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // SAD 3 - Informar apenas disciplina
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('');

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
    // SAD 4 - Nome apenas com espaços
    // =====================================================

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('                                ');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.getByRole('button', {
        name: 'Close'
    }).click();

    // =====================================================
    // SAD 5 - Criar conteúdo para testar edição inválida
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('exe');

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
    // SAD 6 - Editar removendo o nome
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('exe');

    await page.getByRole('button', {
        name: 'Editar'
    }).nth(0).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.getByRole('button', {
        name: 'Close'
    }).click();

    // =====================================================
    // SAD 7 - Pesquisar conteúdo inexistente
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('exeeeee');

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).press('Enter');
});