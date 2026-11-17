import { expect, type Locator, type Page } from "@playwright/test";

export class TaskCard {
  readonly page: Page;
  readonly root: Locator;
  readonly title: Locator;
  readonly priority: Locator;
  readonly assignee: Locator;
  readonly dueDate: Locator;
  readonly commentCount: Locator;
  readonly status: Locator;

  constructor(page: Page, title: string) {
    this.page = page;
    this.root = page.getByTestId("task-card").filter({
      has: page.getByTestId("task-card-title").filter({ hasText: title }),
    });
    this.title = this.root.getByTestId("task-card-title");
    this.priority = this.root.getByTestId("task-card-priority");
    this.assignee = this.root.getByTestId("task-card-assignee");
    this.dueDate = this.root.getByTestId("task-card-duedate");
    this.commentCount = this.root.getByTestId("task-card-comment-count");
    this.status = this.root.getByTestId("task-card-status-select");
  }

  async expectVisible(title: string) {
    await expect(this.title).toBeVisible();
    await expect(this.title).toContainText(title);
  }

  async open() {
    await this.title.click();
  }
}
