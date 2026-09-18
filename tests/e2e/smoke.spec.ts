import { expect, test } from "@playwright/test";

test("home screen exposes the template foundation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Welcome")).toBeVisible();
  await expect(page.getByText("Settings")).toBeVisible();
});
