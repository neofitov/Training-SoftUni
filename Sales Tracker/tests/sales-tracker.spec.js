const { test, expect } = require('@playwright/test');

test.describe('Sales Tracker', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/sales-tracker.html');
  });

  // ─── Smoke ────────────────────────────────────────────────────────────────

  test('page loads with title and 5 tabs', async ({ page }) => {
    await expect(page).toHaveTitle('Sales Tracker');
    for (const name of ['Product Editor', 'Price Editor', 'Locations', 'Sales', 'Reports']) {
      await expect(page.getByRole('tab', { name })).toBeVisible();
    }
  });

  // ─── Product Editor ───────────────────────────────────────────────────────

  test('Product Editor shows the 4 initial products', async ({ page }) => {
    const rows = page.locator('[data-panel="product-editor"] tbody tr');
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0)).toContainText('bread');
    await expect(rows.nth(1)).toContainText('butter');
    await expect(rows.nth(2)).toContainText('eggs');
    await expect(rows.nth(3)).toContainText('yogurt');
  });

  test('can add a new product', async ({ page }) => {
    await page.getByPlaceholder('New product name').fill('milk');
    await page.getByRole('button', { name: 'Add Product' }).click();

    const rows = page.locator('[data-panel="product-editor"] tbody tr');
    await expect(rows).toHaveCount(5);
    await expect(rows.last()).toContainText('milk');
  });

  test('can edit a product name', async ({ page }) => {
    // Click Edit on the first row (bread)
    await page.locator('[data-panel="product-editor"] tbody tr').first()
      .getByRole('button', { name: 'Edit' }).click();

    // Inline input should appear - clear and type new name
    const input = page.locator('[data-panel="product-editor"] tbody tr').first().locator('input');
    await input.fill('sourdough');
    await page.locator('[data-panel="product-editor"] tbody tr').first()
      .getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('[data-panel="product-editor"] tbody')).toContainText('sourdough');
    await expect(page.locator('[data-panel="product-editor"] tbody')).not.toContainText('bread');
  });

  test('can delete a product', async ({ page }) => {
    // Delete yogurt (no sales — safest to delete)
    await page.locator('[data-panel="product-editor"] tbody tr').last()
      .getByRole('button', { name: 'Delete' }).click();

    const rows = page.locator('[data-panel="product-editor"] tbody tr');
    await expect(rows).toHaveCount(3);
    await expect(page.locator('[data-panel="product-editor"] tbody')).not.toContainText('yogurt');
  });

  // ─── Price Editor ─────────────────────────────────────────────────────────

  test('Price Editor shows prices for products that have them', async ({ page }) => {
    await page.getByRole('tab', { name: 'Price Editor' }).click();

    const panel = page.locator('[data-panel="price-editor"]');
    await expect(panel).toContainText('bread');
    await expect(panel).toContainText('3.50');
    await expect(panel).toContainText('butter');
    await expect(panel).toContainText('5.30');
  });

  test('Price Editor shows dash for products without a price', async ({ page }) => {
    // Add a new product — it won't have a price yet
    await page.getByPlaceholder('New product name').fill('milk');
    await page.getByRole('button', { name: 'Add Product' }).click();

    await page.getByRole('tab', { name: 'Price Editor' }).click();
    // milk has no price yet — shows em-dash placeholder
    await expect(page.locator('[data-panel="price-editor"]')).toContainText('milk');
    await expect(page.locator('[data-panel="price-editor"]')).toContainText('—');
  });

  // ─── Locations ────────────────────────────────────────────────────────────

  test('Locations tab lists Sofia and Plovdiv', async ({ page }) => {
    await page.getByRole('tab', { name: 'Locations' }).click();

    const panel = page.locator('[data-panel="locations"]');
    await expect(panel).toContainText('Sofia');
    await expect(panel).toContainText('Plovdiv');
  });

  test('selecting a location shows its sales', async ({ page }) => {
    await page.getByRole('tab', { name: 'Locations' }).click();

    // Click the Sofia location item
    await page.locator('.loc-item').first().click();

    const detail = page.locator('.loc-detail-panel');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText('Sofia');
    // Sofia seed data: bread x2, eggs x5, butter x1
    await expect(detail).toContainText('bread');
    await expect(detail).toContainText('eggs');
    await expect(detail).toContainText('butter');
  });

  test('can add a new location', async ({ page }) => {
    await page.getByRole('tab', { name: 'Locations' }).click();

    await page.getByPlaceholder('Location name').fill('Varna');
    await page.getByPlaceholder('Lat').fill('43.2');
    await page.getByPlaceholder('Lng').fill('27.9');
    await page.getByRole('button', { name: 'Add Location' }).click();

    await expect(page.locator('[data-panel="locations"]')).toContainText('Varna');
  });

  // ─── Reports ──────────────────────────────────────────────────────────────

  test('Reports tab renders revenue tables', async ({ page }) => {
    await page.getByRole('tab', { name: 'Reports' }).click();

    const panel = page.locator('[data-panel="reports"]');
    await expect(panel).toBeVisible();
    // Should show product and location summary data
    await expect(panel).toContainText('bread');
    await expect(panel).toContainText('Revenue');
    await expect(panel).toContainText('Sofia');
  });

});
