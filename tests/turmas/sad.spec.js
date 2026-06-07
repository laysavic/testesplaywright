import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test.describe('SAD - Cadastro de Turmas', () => {
    
     test.describe.configure({
        mode: 'serial'
    });

    test.beforeEach(async ({ page }) => {

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
            name: 'Turmas'
        }).click();

        await page.getByRole('button', {
            name: 'Adicionar nova turma'
        }).click();
    });

    // =====================================================
    // SAD 01 - Sem preencher nenhum campo
    // =====================================================

    test('SAD - Criar turma sem preencher campos obrigatórios', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();

        await expect(
            page.getByRole('button', {
                name: 'Salvar'
            })
        ).toBeVisible();
    });

    // =====================================================
    // SAD 02 - Sem curso
    // =====================================================

    test('SAD - Criar turma sem informar curso', async ({ page }) => {

        await page.getByRole('textbox', {
            name: 'Ano: *'
        }).fill('2026');

        await page.getByRole('combobox', {
            name: 'Série ou semestre da turma:'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('combobox', {
            name: /Turno/i
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // SAD 03 - Sem ano
    // =====================================================

    test('SAD - Criar turma sem informar ano', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Curso'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('combobox', {
            name: 'Série ou semestre da turma:'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('combobox', {
            name: /Turno/i
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // SAD 04 - Sem série ou semestre
    // =====================================================

    test('SAD - Criar turma sem informar série ou semestre', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Curso'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('textbox', {
            name: 'Ano: *'
        }).fill('2026');

        await page.getByRole('combobox', {
            name: /Turno/i
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

    // =====================================================
    // SAD 05 - Sem turno
    // =====================================================

    test('SAD - Criar turma sem informar turno', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Curso'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('textbox', {
            name: 'Ano: *'
        }).fill('2026');

        await page.getByRole('combobox', {
            name: 'Série ou semestre da turma:'
        }).click();

        await page.getByRole('option').first().click();

        await page.getByRole('button', {
            name: 'Salvar'
        }).click();
    });

});