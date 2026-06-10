import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

// =====================================================
// LOGIN
// =====================================================

async function login(page) {

    const secret = '2DINPFKXGBLME2VO';

    await page.goto('https://app.avaliei.com.br/login');

    await page.getByRole('textbox', { name: 'Email' })
        .fill('e2e-super-teacher-23@example.com');

    await page.getByRole('textbox', { name: 'Senha' })
        .fill('password');

    await page.getByRole('button', { name: 'Entrar' }).click();

    const otpInput = page.getByRole('textbox', {
        name: /Código de verificação/i
    });

    await otpInput.waitFor({ state: 'visible' });

    const otp = authenticator.generate(secret);

    await otpInput.fill(otp);

    await page.getByRole('button', {
        name: /Verificar código/i
    }).click();

    await page.waitForURL(/dashboard/);
    await page.waitForTimeout(2000);
}

// =====================================================
// TESTE SAD
// =====================================================

test('SAD - Cadastro de Cursos', async ({ page }) => {

    await login(page);

    // =====================================================
    // ACESSAR CURSOS (UMA VEZ SÓ)
    // =====================================================

    const turmasBtn = page.getByRole('button', { name: /turmas/i });
    await turmasBtn.waitFor({ state: 'visible' });
    await turmasBtn.click();

    const cursosLink = page.getByText(/cursos/i);
    await cursosLink.waitFor({ state: 'visible' });
    await cursosLink.click();

    // garante tela carregada
    const addCursoBtn = page.getByRole('button', { name: /Adicionar Curso/i });
    await expect(addCursoBtn).toBeVisible({ timeout: 15000 });

    // =====================================================
    // SAD 1 - salvar vazio
    // =====================================================

    await addCursoBtn.click();
    await page.getByRole('button', { name: 'Salvar' }).click();

    // =====================================================
    // SAD 2 - só nível
    // =====================================================

    await page.getByRole('button', { name: 'Nível de Escolaridade' }).click();
    await page.getByRole('option', { name: 'Técnico' }).click();

    await page.getByRole('button', { name: 'Salvar' }).click();

    // =====================================================
    // SAD 3 - abrir dropdown sem salvar
    // =====================================================


    await page.getByRole('button', { name: 'Nível de Escolaridade' }).click();

    const cancelar = page.getByRole('button', { name: /cancelar/i });
    if (await cancelar.count() > 0) {
        await cancelar.click();
    }

    // =====================================================
    // SAD 4 - só nome
    // =====================================================


    await page.getByRole('textbox', {
        name: 'Nome do Curso: *'
    }).fill('curso_teste_sad');

    await page.getByRole('button', { name: 'Salvar' }).click();
});