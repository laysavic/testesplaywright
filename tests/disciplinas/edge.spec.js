import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('EDGE - Casos extremos do CRUD de disciplinas', async ({ page }) => {

    // ===== LOGIN =====
    const secret = '2DINPFKXGBLME2VO';
    const otp = authenticator.generate(secret);

    await page.goto('https://app.avaliei.com.br/login');

    await page.getByRole('textbox', { name: 'Email' })
        .fill('e2e-super-teacher-23@example.com');

    await page.getByRole('textbox', { name: 'Senha' })
        .fill('password');

    await page.getByRole('button', { name: 'Entrar' })
        .click();

    await page.getByRole('textbox', {
        name: /Código de verificação/i
    }).fill(otp);

    await page.getByRole('button', {
        name: /Verificar código/i
    }).click();

    await page.getByRole('link', {
        name: 'Disciplinas'
    }).click();

    // =====================================================
    // EDGE 01 - Nome muito grande
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar disciplina'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da disciplina: *'
    }).fill(
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    );

    await page.getByRole('button', {
        name: 'Selecione a área da disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Ciências humanas e suas tecnologias'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 02 - Caracteres especiais
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar disciplina'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da disciplina: *'
    }).fill('@#$%¨&*()');

    await page.getByRole('button', {
        name: 'Selecione a área da disciplina'
    }).click();

    await page.getByRole('option').first().click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 03 - Apenas números
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar disciplina'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da disciplina: *'
    }).fill('123456');

    await page.getByRole('button', {
        name: 'Selecione a área da disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Ciências da natureza e suas tecnologias'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 04 - Letras e números
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar disciplina'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da disciplina: *'
    }).fill('Matematica2026');

    await page.getByRole('button', {
        name: 'Selecione a área da disciplina'
    }).click();

    await page.getByRole('option').first().click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

    // =====================================================
    // EDGE 05 - Pesquisa sem resultados
    // =====================================================

    await page.getByRole('textbox', {
        name: 'Pesquisar disciplina...'
    }).fill('xyz123teste');

    await page.keyboard.press('Enter');

    // =====================================================
    // EDGE 06 - Espaços antes e depois
    // =====================================================

    await page.getByRole('button', {
        name: 'Adicionar disciplina'
    }).click();

    await page.getByRole('textbox', {
        name: 'Nome da disciplina: *'
    }).fill('     Matemática     ');

    await page.getByRole('button', {
        name: 'Selecione a área da disciplina'
    }).click();

    await page.getByRole('option', {
        name: 'Matemática e suas tecnologias'
    }).click();

    await page.getByRole('button', {
        name: 'Salvar'
    }).click();

});