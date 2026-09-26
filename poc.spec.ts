import { test, expect, type Page } from "@playwright/test";

// DOM focus plus cmdk's highlighted item. cmdk never moves DOM focus to an option.
const where = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    const tag = el
      ? `${el.tagName}${el.hasAttribute("cmdk-input") ? "[cmdk-input]" : ""} role=${el.getAttribute("role")} slot=${el.getAttribute("data-slot")}`
      : "none";
    const insideCmdk = el?.closest("[cmdk-root]") != null;
    const hl = document.querySelector('[cmdk-item][data-selected="true"]')?.textContent ?? "-";
    return `${tag} | insideCmdkRoot=${insideCmdk} | highlighted=${hl}`;
  });

for (const [name, query] of [
  ["select", ""],
  ["select-searchable", "?searchable=1"],
] as const) {
  test(name, async ({ page }) => {
    await page.goto(`/${query}`);
    await page.getByRole("button", { name: "before" }).focus();
    for (const key of ["Tab", "Enter", "ArrowDown", "Enter"]) {
      await page.keyboard.press(key);
      await page.waitForTimeout(150);
      console.log(`[${name}]`, key.padEnd(10), "->", await where(page));
    }
    await expect(page.getByTestId("value")).toHaveText("b", { timeout: 1000 });
  });
}
