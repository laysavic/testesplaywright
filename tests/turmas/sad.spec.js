import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

// =====================================================
// LOGIN
// =====================================================

async function login(page) {


const secret = '2DINPFKXGBLME2VO';
const otp = authenticator.generate(secret);

await page.goto('https://app.avaliei.com.br/login');

await expect(
    page.getByRole('textbox', { name: 'Email' })
).toBeVisible({ timeout: 15000 });

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

await page.waitForURL(/dashboard/, {
    timeout: 20000
});

// =====================================================
// ACESSAR TURMAS
// =====================================================

await page.getByRole('button', {
    name: /turmas/i
}).click();

await page.getByRole('link', {
    name: /^Turmas$/
}).click();


}

// =====================================================
// ABRIR MODAL
// =====================================================

async function abrirModal(page) {


await page.getByRole('button', {
    name: /Adicionar nova turma/i
}).click();

await expect(
    page.getByRole('textbox', {
        name: /Ano/i
    })
).toBeVisible();


}

// =====================================================
// SAD
// =====================================================

test.describe('SAD - Cadastro de Turmas', () => {
test.describe.configure({
    mode: 'serial'
});

test.beforeEach(async ({ page }) => {
    await login(page);
});

// =====================================================
// SAD 01
// =====================================================

test('Salvar sem preencher campos', async ({ page }) => {

    await abrirModal(page);

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();
});

// =====================================================
// SAD 02
// =====================================================

test('Salvar sem curso', async ({ page }) => {

    await abrirModal(page);

    await page.getByRole('textbox', {
        name: /Ano/i
    }).fill('2026');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();
});

// =====================================================
// SAD 03
// =====================================================

test('Salvar sem ano', async ({ page }) => {

    await abrirModal(page);

    await page.getByRole('button', {
        name: 'Curso'
    }).click();

    await page.getByRole('option').first().click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();
});

// =====================================================
// SAD 04
// =====================================================

test('Salvar sem série ou semestre', async ({ page }) => {

    await abrirModal(page);

    await page.getByRole('button', {
        name: 'Curso'
    }).click();

    await page.getByRole('option').first().click();

    await page.getByRole('textbox', {
        name: /Ano/i
    }).fill('2026');

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();
});

// =====================================================
// SAD 05
// =====================================================

test('Salvar sem turno', async ({ page }) => {

    await abrirModal(page);

    await page.getByRole('button', {
        name: 'Curso'
    }).click();

    await page.getByRole('option').first().click();

    await page.getByRole('textbox', {
        name: /Ano/i
    }).fill('2026');

    const comboSerie = page.getByRole('combobox').first();

    await comboSerie.click();

    await page.getByRole('option').first().click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();
});

});
