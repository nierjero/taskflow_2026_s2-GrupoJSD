import { expect, type Locator, type Page } from "@playwright/test";

export class TaskDetailPage {
  readonly page: Page;
  readonly container: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly priority: Locator;
  readonly assignee: Locator;
  readonly dueDate: Locator;
  readonly save: Locator;
  readonly delete: Locator;
  readonly tagInput: Locator;
  readonly tagSubmit: Locator;
  readonly tagList: Locator;
  readonly commentInput: Locator;
  readonly commentSubmit: Locator;
  readonly commentList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId("task-detail-page");
    this.title = page.getByTestId("task-title-input");
    this.description = page.getByTestId("task-description-input");
    this.priority = page.getByTestId("task-priority-select");
    this.assignee = page.getByTestId("task-assignee-select");
    this.dueDate = page.getByTestId("task-duedate-input");
    this.save = page.getByTestId("task-save-button");
    this.delete = page.getByTestId("task-delete-button");
    this.tagInput = page.getByTestId("tag-add-input");
    this.tagSubmit = page.getByTestId("tag-add-button");
    this.tagList = page.getByTestId("tag-list");
    this.commentInput = page.getByTestId("comment-add-input");
    this.commentSubmit = page.getByTestId("comment-add-button");
    this.commentList = page.getByTestId("comment-list");
  }

  async waitForLoad() {
    await expect(this.container).toBeVisible();
  }

  async edit(options: { title: string; priority: "LOW" | "MEDIUM" | "HIGH" }) {
    await this.title.fill(options.title);
    await this.priority.selectOption(options.priority);

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes("/api/tasks/") &&
          res.request().method() === "PATCH",
      ),
      this.save.click(),
    ]);

    return response;
  }

  async addTag(name: string) {
    await this.tagInput.fill(name);

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes("/api/tasks/") &&
          res.url().includes("/tags") &&
          res.request().method() === "POST",
      ),
      this.tagSubmit.click(),
    ]);

    await expect(this.tagList).toContainText(name);
    return response;
  }

  async addComment(body: string) {
    await this.commentInput.fill(body);

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes("/api/tasks/") &&
          res.url().includes("/comments") &&
          res.request().method() === "POST",
      ),
      this.commentSubmit.click(),
    ]);

    await expect(this.commentList).toContainText(body);
    return response;
  }
}
