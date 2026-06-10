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

async function abrirDisciplinas(page) {

    await page.getByRole('button', { 
        name: 'Disciplinas' 
    }).click();

    await page.getByRole('link', {
        name: 'Disciplinas'
    }).click();
}

// =====================================================
// SAD 01
// =====================================================

test('SAD - Criar disciplina sem preencher campos obrigatórios', async ({ page }) => {

    await fazerLogin(page);

    await abrirDisciplinas(page);

    await page.getByRole('button', {
        name: 'Adicionar disciplina'
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

test('SAD - Criar disciplina sem selecionar área', async ({ page }) => {

    await fazerLogin(page);

    await abrirDisciplinas(page);

    await page.getByRole('button', {
        name: 'Adicionar disciplina'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da disciplina: *'
    }).fill('Cursinho');

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

test('SAD - Criar disciplina sem informar nome', async ({ page }) => {

    await fazerLogin(page);

    await page.getByRole('button', {
        name: 'Disciplinas'
    }).click();

    await page.getByRole('link', {
        name: 'Disciplinas'
    }).click();

    await page.getByRole('button', {
        name: 'Adicionar disciplina'
    }).click();

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
        page.getByText('Este campo é obrigatório')
    ).toHaveCount(1);
});