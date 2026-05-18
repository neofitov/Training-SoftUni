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
    await expect(panel).toContainText('bread');
    await expect(panel).toContainText('Total');
    await expect(panel).toContainText('Sofia');
  });

  test('Reports pivot shows location columns and product rows', async ({ page }) => {
    await page.getByRole('tab', { name: 'Reports' }).click();
    const panel = page.locator('[data-panel="reports"]');
    // All 4 products and both locations visible
    for (const text of ['bread', 'butter', 'eggs', 'yogurt', 'Sofia', 'Plovdiv', 'Total']) {
      await expect(panel).toContainText(text);
    }
  });

  test('Reports pivot shows correct revenue per cell', async ({ page }) => {
    await page.getByRole('tab', { name: 'Reports' }).click();
    const panel = page.locator('[data-panel="reports"]');
    // bread in Sofia: 2 × 3.50 = 7.00
    // butter in Plovdiv: 2 × 5.30 = 10.60
    await expect(panel).toContainText('7.00');
    await expect(panel).toContainText('10.60');
  });

  test('Reports pivot totals row shows per-location totals', async ({ page }) => {
    await page.getByRole('tab', { name: 'Reports' }).click();
    const tfoot = page.locator('[data-panel="reports"] tfoot');
    // Sofia: bread 7.00 + eggs 2.00 + butter 5.30 = 14.30
    // Plovdiv: eggs 1.20 + butter 10.60 + bread 3.50 = 15.30
    await expect(tfoot).toContainText('14.30');
    await expect(tfoot).toContainText('15.30');
  });

  test('Reports pivot grand total is correct', async ({ page }) => {
    await page.getByRole('tab', { name: 'Reports' }).click();
    const tfoot = page.locator('[data-panel="reports"] tfoot');
    // 14.30 + 15.30 = 29.60
    await expect(tfoot).toContainText('29.60');
  });

  // ─── Sales ────────────────────────────────────────────────────────────────

  test('Sales tab shows all 6 sales across both locations', async ({ page }) => {
    await page.getByRole('tab', { name: 'Sales' }).click();
    const rows = page.locator('[data-panel="sales"] tbody tr');
    await expect(rows).toHaveCount(6);
  });

  test('Sales tab shows correct column headers', async ({ page }) => {
    await page.getByRole('tab', { name: 'Sales' }).click();
    const panel = page.locator('[data-panel="sales"]');
    for (const col of ['Product', 'Location', 'Qty', 'Unit Price', 'Revenue']) {
      await expect(panel).toContainText(col);
    }
  });

  test('Sales tab totals row shows total qty and revenue', async ({ page }) => {
    await page.getByRole('tab', { name: 'Sales' }).click();
    const tfoot = page.locator('[data-panel="sales"] tfoot');
    // Total qty: 2+5+1+3+2+1 = 14, total revenue: 29.60
    await expect(tfoot).toContainText('14');
    await expect(tfoot).toContainText('29.60');
  });

  test('Sales tab filter by location shows only that location', async ({ page }) => {
    await page.getByRole('tab', { name: 'Sales' }).click();
    await page.locator('[data-panel="sales"] select').nth(1).selectOption('Sofia');
    const rows = page.locator('[data-panel="sales"] tbody tr');
    await expect(rows).toHaveCount(3);
    // All visible rows belong to Sofia
    await expect(page.locator('[data-panel="sales"] tbody')).not.toContainText('Plovdiv');
  });

  test('Sales tab filter by product narrows the table', async ({ page }) => {
    await page.getByRole('tab', { name: 'Sales' }).click();
    await page.locator('[data-panel="sales"] select').nth(0).selectOption('bread');
    const rows = page.locator('[data-panel="sales"] tbody tr');
    await expect(rows).toHaveCount(2); // bread in Sofia and Plovdiv
  });

  test('Sales tab clear filters restores all rows', async ({ page }) => {
    await page.getByRole('tab', { name: 'Sales' }).click();
    await page.locator('[data-panel="sales"] select').nth(0).selectOption('eggs');
    await page.locator('[data-panel="sales"]').getByRole('button', { name: 'Clear filters' }).click();
    const rows = page.locator('[data-panel="sales"] tbody tr');
    await expect(rows).toHaveCount(6);
  });

  test('Sales tab sort by Revenue sorts the rows', async ({ page }) => {
    await page.getByRole('tab', { name: 'Sales' }).click();
    // Click Revenue sort button
    await page.locator('[data-panel="sales"]').getByRole('button', { name: /Revenue/ }).click();
    const firstCell = page.locator('[data-panel="sales"] tbody tr').first().locator('td').last();
    const lastCell  = page.locator('[data-panel="sales"] tbody tr').last().locator('td').last();
    const first = parseFloat(await firstCell.innerText());
    const last  = parseFloat(await lastCell.innerText());
    expect(first).toBeLessThanOrEqual(last); // ascending after first click
  });

});
