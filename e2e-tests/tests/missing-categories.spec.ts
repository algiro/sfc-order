import { test, expect } from '@playwright/test';

test.describe('SFC Order Application - Missing Categories Analysis', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application and access "Tomar Pedidos"
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('SFC Order');
    
    // Click on "Tomar Pedidos"
    await page.locator('button').filter({ hasText: /Tomar Pedidos|Take Orders/ }).click();
    
    // Select first table
    await page.locator('button').filter({ hasText: /Mesa|Table/ }).first().click();
    
    // Select a waiter
    await page.locator('button').filter({ hasText: /María Maye|Erin|Carlos|Ana|👤/ }).first().click();
    
    // Should now see category selection
    await expect(page.locator('text=Seleccionar Categoría')).toBeVisible();
  });

  test('should show Cafés category but with empty or missing items', async ({ page }) => {
    // Navigate to Cafés category
    const cafesButton = page.locator('button').filter({ hasText: /Cafés|Coffee/ }).first();
    await expect(cafesButton).toBeVisible();
    await cafesButton.click();
    
    // Check if we see any items or an empty state
    await page.waitForTimeout(2000);
    
    // Look for common indicators of empty state
    const hasItems = await page.locator('[class*="item"], [data-testid*="menu-item"]').count();
    const hasEmptyMessage = await page.locator('text=/No hay|No items|Sin elementos|Empty/i').isVisible();
    const hasLoadingSpinner = await page.locator('[class*="loading"], [class*="spinner"]').isVisible();
    
    console.log(`Cafés category - Items found: ${hasItems}, Empty message: ${hasEmptyMessage}, Loading: ${hasLoadingSpinner}`);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/cafes-category-state.png' });
    
    // This test documents the current state - it should fail if no items are shown
    if (hasItems === 0 && !hasEmptyMessage) {
      throw new Error('Cafés category appears to be broken - no items and no empty state message');
    }
  });

  test('should show Té category but with empty or missing items', async ({ page }) => {
    // Navigate to Té category
    const teButton = page.locator('button').filter({ hasText: /Té e Infusiones|Tea.*Infusions|Té|Tea/ }).first();
    await expect(teButton).toBeVisible();
    await teButton.click();
    
    await page.waitForTimeout(2000);
    
    const hasItems = await page.locator('[class*="item"], [data-testid*="menu-item"]').count();
    const hasEmptyMessage = await page.locator('text=/No hay|No items|Sin elementos|Empty/i').isVisible();
    const hasLoadingSpinner = await page.locator('[class*="loading"], [class*="spinner"]').isVisible();
    
    console.log(`Té category - Items found: ${hasItems}, Empty message: ${hasEmptyMessage}, Loading: ${hasLoadingSpinner}`);
    
    await page.screenshot({ path: 'test-results/te-category-state.png' });
    
    if (hasItems === 0 && !hasEmptyMessage) {
      throw new Error('Té category appears to be broken - no items and no empty state message');
    }
  });

  test('should show Bebidas category but with empty or missing items', async ({ page }) => {
    // Navigate to Bebidas category  
    const bebidasButton = page.locator('button').filter({ hasText: /Bebidas|Drinks/ }).first();
    await expect(bebidasButton).toBeVisible();
    await bebidasButton.click();
    
    await page.waitForTimeout(2000);
    
    const hasItems = await page.locator('[class*="item"], [data-testid*="menu-item"]').count();
    const hasEmptyMessage = await page.locator('text=/No hay|No items|Sin elementos|Empty/i').isVisible();
    const hasLoadingSpinner = await page.locator('[class*="loading"], [class*="spinner"]').isVisible();
    
    console.log(`Bebidas category - Items found: ${hasItems}, Empty message: ${hasEmptyMessage}, Loading: ${hasLoadingSpinner}`);
    
    await page.screenshot({ path: 'test-results/bebidas-category-state.png' });
    
    if (hasItems === 0 && !hasEmptyMessage) {
      throw new Error('Bebidas category appears to be broken - no items and no empty state message');
    }
  });

  test('should show Tostas category but with empty or missing items', async ({ page }) => {
    // Navigate to Tostas category
    const tostasButton = page.locator('button').filter({ hasText: /Tostas|Toast/ }).first();
    await expect(tostasButton).toBeVisible();
    await tostasButton.click();
    
    await page.waitForTimeout(2000);
    
    const hasItems = await page.locator('[class*="item"], [data-testid*="menu-item"]').count();
    const hasEmptyMessage = await page.locator('text=/No hay|No items|Sin elementos|Empty/i').isVisible();
    const hasLoadingSpinner = await page.locator('[class*="loading"], [class*="spinner"]').isVisible();
    
    console.log(`Tostas category - Items found: ${hasItems}, Empty message: ${hasEmptyMessage}, Loading: ${hasLoadingSpinner}`);
    
    await page.screenshot({ path: 'test-results/tostas-category-state.png' });
    
    if (hasItems === 0 && !hasEmptyMessage) {
      throw new Error('Tostas category appears to be broken - no items and no empty state message');
    }
  });

  test('should show Arepas category but with empty or missing items', async ({ page }) => {
    // Navigate to Arepas category
    const arepasButton = page.locator('button').filter({ hasText: /Arepas/ }).first();
    await expect(arepasButton).toBeVisible();
    await arepasButton.click();
    
    await page.waitForTimeout(2000);
    
    const hasItems = await page.locator('[class*="item"], [data-testid*="menu-item"]').count();
    const hasEmptyMessage = await page.locator('text=/No hay|No items|Sin elementos|Empty/i').isVisible();
    const hasLoadingSpinner = await page.locator('[class*="loading"], [class*="spinner"]').isVisible();
    
    console.log(`Arepas category - Items found: ${hasItems}, Empty message: ${hasEmptyMessage}, Loading: ${hasLoadingSpinner}`);
    
    await page.screenshot({ path: 'test-results/arepas-category-state.png' });
    
    if (hasItems === 0 && !hasEmptyMessage) {
      throw new Error('Arepas category appears to be broken - no items and no empty state message');
    }
  });

  test('should verify working categories (Cuencos and Smoothies) for comparison', async ({ page }) => {
    // Test Cuencos first
    const cuencosButton = page.locator('button').filter({ hasText: /Cuencos|Bowls/ }).first();
    await expect(cuencosButton).toBeVisible();
    await cuencosButton.click();
    
    // Should see bowl builder
    await expect(page.locator('text=/Cuenco Personalizado|Custom Bowl|Personaliza|Customize/')).toBeVisible({ timeout: 5000 });
    
    // Go back
    await page.locator('button').filter({ hasText: /Volver|Back|←/ }).first().click();
    
    // Test Smoothies
    const smoothiesButton = page.locator('button').filter({ hasText: /Smoothies/ }).first();
    await expect(smoothiesButton).toBeVisible();
    await smoothiesButton.click();
    
    // Should see smoothie items
    await expect(page.locator('text=/Tropical|Berry Blast|Green Power/')).toBeVisible({ timeout: 5000 });
    
    console.log('Working categories (Cuencos and Smoothies) verified successfully');
  });
});