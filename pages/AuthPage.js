import { TOTP } from 'totp-generator';

export class AuthPage {
  constructor(page) {
    this.page = page;
    // Login elements
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.getByRole('button', { name: 'Entrar' });
    // 2FA elements
    this.otpInput = page.getByRole('textbox', { name: 'Código de verificação de 6 dí' });
    this.verifyBtn = page.getByRole('button', { name: 'Verificar código de autentica' });
  }

  async goto() {
    await this.page.goto('https://app.avaliei.com.br/login');
    await this.emailInput.waitFor({ state: 'visible' });
  }

  async fillCredentials(email, password) {
    await this.emailInput.click();
    await this.emailInput.fill(email);
    await this.passwordInput.click();
    await this.passwordInput.fill(password);
  }

  async submitLogin() {
    await this.loginButton.click();
  }

  async submitOtp(code) {
    await this.otpInput.waitFor({ state: 'visible' });
    await this.otpInput.fill(String(code));
    await this.verifyBtn.click();
  }

  async generateTotpCode(secret) {
    const epoch = Math.floor(Date.now() / 1000);
    const remaining = 30 - (epoch % 30);
    if (remaining < 5) {
      await new Promise(resolve => setTimeout(resolve, (remaining + 1) * 1000));
    }
    const { otp } = await TOTP.generate(secret);
    return otp;
  }

  async authenticateWithTotp(email, password, totpSecret) {
    await this.goto();
    await this.fillCredentials(email, password);
    await this.submitLogin();
    const code = await this.generateTotpCode(totpSecret);
    await this.submitOtp(code);
  }
}