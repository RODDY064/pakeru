import { test, expect } from "@playwright/test";


test.use({ trace: "on" });


test("has title", async ({ page, baseURL }) => {

  // 
  const url = process.env.NEXT_PUBLIC_URL

  await page.goto(baseURL || `${url}`);
  await expect(page).toHaveTitle(/E-come/i);
});

