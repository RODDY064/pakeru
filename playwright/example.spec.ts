import { test, expect } from "@playwright/test";


test.use({ trace: "on" });


test("has title", async ({ page, baseURL }) => {
  await page.goto(baseURL || "http://localhost:3000");
  await expect(page).toHaveTitle(/E-come/i);
});
