import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test.describe.configure({
    mode: 'serial'
});

async function fazerLogin(page) {

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

    await page.waitForURL(/2fa/, {
        timeout: 15000
    });

    const otp = authenticator.generate(secret);

    await page.getByRole('textbox', {
        name: /Código de verificação/i
    }).fill(otp);

    await page.getByRole('button', {
        name: /Verificar código/i
    }).click();

    await expect(page).toHaveURL(/dashboard/, {
        timeout: 20000
    });
}

async function abrirConteudos(page) {

    await page.getByRole('button', {
        name: 'Disciplinas'
    }).click();

    await page.getByRole('link', {
        name: 'Conteúdos'
    }).click();
}

// =====================================================
// SAD 01
// =====================================================

test('SAD - Salvar conteúdo sem preencher nada', async ({ page }) => {

    await fazerLogin(page);
    await abrirConteudos(page);

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await expect(
        page.getByText('Este campo é obrigatório')
    ).toHaveCount(2);
});

// =====================================================
// SAD 02
// =====================================================

test('SAD - Informar apenas nome', async ({ page }) => {

    await fazerLogin(page);
    await abrirConteudos(page);

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('cones');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await expect(
        page.getByText('Este campo é obrigatório')
    ).toHaveCount(1);
});

// =====================================================
// SAD 03
// =====================================================

test('SAD - Informar apenas disciplina', async ({ page }) => {

    await fazerLogin(page);
    await abrirConteudos(page);

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Espanhol'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await expect(
        page.getByText('Este campo é obrigatório')
    ).toHaveCount(1);
});

// =====================================================
// SAD 04
// =====================================================

test('SAD - Nome somente com espaços', async ({ page }) => {

    await fazerLogin(page);
    await abrirConteudos(page);

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('          ');

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Espanhol'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();
});

// =====================================================
// SAD 05
// =====================================================

test('SAD - Editar removendo o nome', async ({ page }) => {

    await fazerLogin(page);
    await abrirConteudos(page);

    const nomeTeste = `exe-${Date.now()}`;

    await page.getByRole('button', {
        name: 'Adicionar Conteúdo'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill(nomeTeste);

    await page.getByRole('button', {
        name: 'Disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Educação Física'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill(nomeTeste);

    await page.getByRole('button', {
        name: 'Editar'
    }).first().click();

    await page.getByRole('textbox', {
        name: 'Nome do conteúdo: *'
    }).fill('');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();
});

// =====================================================
// SAD 06
// =====================================================

test('SAD - Pesquisar conteúdo inexistente', async ({ page }) => {

    await fazerLogin(page);
    await abrirConteudos(page);

    await page.getByRole('textbox', {
        name: 'Pesquisar conteúdo...'
    }).fill('exeeeee123456789');

    await page.keyboard.press('Enter');
});