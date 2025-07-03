import { test, expect } from "@playwright/test";

test.use({ trace: "on" });

test("has title", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page).toHaveTitle(/GET THE LOOKS, ROCK IT/i);
});
