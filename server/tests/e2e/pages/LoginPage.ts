import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly pageContainer: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageContainer = page.getByTestId("login-page");
    this.email = page.getByTestId("login-email-input");
    this.password = page.getByTestId("login-password-input");
    this.submit = page.getByTestId("login-submit");
  }

  async open() {
    await this.page.goto("/login");
    await expect(this.pageContainer).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes("/api/auth/login") &&
          res.request().method() === "POST",
      ),
      this.submit.click(),
    ]);

    return response;
  }
}
