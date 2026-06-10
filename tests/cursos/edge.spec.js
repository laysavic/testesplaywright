import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('EDGE - Cadastro de Cursos', async ({ page }) => {

    // =====================================================
    // LOGIN
    // =====================================================

    const secret = '2DINPFKXGBLME2VO';
    const otp = authenticator.generate(secret);

    await page.goto('https://app.avaliei.com.br/login');

    await page.getByRole('textbox', { name: 'Email' })
        .fill('e2e-super-teacher-23@example.com');

    await page.getByRole('textbox', { name: 'Senha' })
        .fill('password');

    await page.getByRole('button', { name: 'Entrar' }).click();

    await page.getByRole('textbox', {
        name: /Código de verificação/i
    }).fill(otp);

    await page.getByRole('button', {
        name: /Verificar código/i
    }).click();

    await page.waitForURL(/dashboard/);

    // =====================================================
    // ACESSAR CURSOS
    // =====================================================

    await page.getByRole('button', { name: /turmas/i }).click();
    await page.getByRole('link', { name: /cursos/i }).click();

    // garante que carregou a tela
    const addCursoBtn = page.getByRole('button', {
        name: /Adicionar Curso/i
    });

    await expect(addCursoBtn).toBeVisible({ timeout: 15000 });

    // =====================================================
    // EDGE 1 - Nome com 1 caractere
    // =====================================================

    await addCursoBtn.click();

    await page.getByRole('textbox', { name: /Nome do Curso/i }).fill('a');

    await page.getByRole('button', { name: 'Nível de Escolaridade' }).click();
    await page.getByRole('option', { name: /Fundamental|Técnico|Médio/i }).first().click();

    await page.getByRole('button', { name: 'Salvar' }).click();

    // =====================================================
    // EDGE 2 - Nome muito longo
    // =====================================================

    await addCursoBtn.click();

    await page.getByRole('textbox', { name: /Nome do Curso/i })
        .fill('a'.repeat(200));

    await page.getByRole('button', { name: 'Nível de Escolaridade' }).click();
    await page.getByRole('option', { name: /Fundamental|Técnico|Médio/i }).first().click();

    await page.getByRole('button', { name: 'Salvar' }).click();

    // =====================================================
    // EDGE 3 - Nome com números
    // =====================================================

    await addCursoBtn.click();

    await page.getByRole('textbox', { name: /Nome do Curso/i })
        .fill('curso123456');

    await page.getByRole('button', { name: 'Nível de Escolaridade' }).click();
    await page.getByRole('option', { name: /Fundamental|Técnico|Médio/i }).first().click();

    await page.getByRole('button', { name: 'Salvar' }).click();

    // =====================================================
    // EDGE 4 - Espaços internos
    // =====================================================

    await addCursoBtn.click();

    await page.getByRole('textbox', { name: /Nome do Curso/i })
        .fill('curso     com     espaços');

    await page.getByRole('button', { name: 'Nível de Escolaridade' }).click();
    await page.getByRole('option', { name: /Fundamental|Técnico|Médio/i }).first().click();

    await page.getByRole('button', { name: 'Salvar' }).click();

    // =====================================================
    // EDGE 5 - Maiúsculo
    // =====================================================

    await addCursoBtn.click();

    await page.getByRole('textbox', { name: /Nome do Curso/i })
        .fill('CURSO EDGE TESTE');

    await page.getByRole('button', { name: 'Nível de Escolaridade' }).click();
    await page.getByRole('option', { name: /Fundamental|Técnico|Médio/i }).first().click();

    await page.getByRole('button', { name: 'Salvar' }).click();

    // =====================================================
    // EDGE 6 - Pesquisa parcial
    // =====================================================

    const search = page.getByRole('textbox', { name: /Pesquisar/i });

    await search.fill('cur');
    await search.press('Enter');

    // =====================================================
    // EDGE 7 - Pesquisa com acento
    // =====================================================

    await search.fill('líng');

    // =====================================================
    // EDGE 8 - Limpar pesquisa
    // =====================================================

    await search.fill('');
});