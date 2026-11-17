import { expect, type Locator, type Page } from "@playwright/test";

export class BoardPage {
  readonly page: Page;
  readonly container: Locator;
  readonly projectName: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly prioritySelect: Locator;
  readonly assigneeSelect: Locator;
  readonly dueDateInput: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId("board-page");
    this.projectName = page.getByTestId("board-project-name");
    this.titleInput = page.getByTestId("task-create-title-input");
    this.descriptionInput = page.getByTestId("task-create-description-input");
    this.prioritySelect = page.getByTestId("task-create-priority-select");
    this.assigneeSelect = page.getByTestId("task-create-assignee-select");
    this.dueDateInput = page.getByTestId("task-create-duedate-input");
    this.submit = page.getByTestId("task-create-submit");
  }

  async waitForLoad() {
    await expect(this.container).toBeVisible();
  }

  async openProjectByName(name: string) {
    await this.page
      .getByTestId("project-card-name")
      .filter({ hasText: name })
      .click();

    await this.waitForLoad();
  }

  async createTask(options: {
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    assigneeEmail: string;
    dueDate: string;
  }) {
    await this.titleInput.fill(options.title);
    await this.descriptionInput.fill(options.description);
    await this.prioritySelect.selectOption(options.priority);
    await this.assigneeSelect.selectOption("");
    await this.dueDateInput.fill(options.dueDate);

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes("/api/projects/") &&
          res.url().includes("/tasks") &&
          res.request().method() === "POST",
      ),
      this.submit.click(),
    ]);

    return response;
  }

  taskCard(title: string) {
    return this.page.getByTestId("task-card").filter({
      has: this.page.getByTestId("task-card-title").filter({ hasText: title }),
    });
  }

  async openTask(title: string) {
    await this.page
      .getByTestId("task-card-title")
      .filter({ hasText: title })
      .click();
  }
}
