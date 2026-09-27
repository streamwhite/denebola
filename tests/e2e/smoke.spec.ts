import { expect, test } from "@playwright/test";

test("consumer app renders through the template provider", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Consumer App")).toBeVisible();
  await expect(page.getByText("Built on @your-scope/mobile-template.")).toBeVisible();
});
