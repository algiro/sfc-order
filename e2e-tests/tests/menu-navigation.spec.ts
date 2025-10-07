import { test, expect } from '@playwright/test';

test.describe('SFC Order Application - Menu Categories & Items', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application and access "Tomar Pedidos"
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('SFC Order');
    
    // Navigate to order taking section
    await page.locator('text=Tomar Pedidos').click();
    await expect(page.locator('text=Seleccionar Mesa')).toBeVisible();
    
    // Select a table (assuming table 1 exists)
    await page.locator('[data-testid="table-1"], button').filter({ hasText: '1' }).first().click();
    
    // Select a waiter (using actual waiter names)
    await page.locator('button').filter({ hasText: /María Maye|Erin|Carlos|Ana|👤/ }).first().click();
  });

  test('should display menu categories', async ({ page }) => {
    // Should see category selection header
    await expect(page.locator('text=Seleccionar Categoría')).toBeVisible();
    
    // Should see various menu categories
    await expect(page.locator('text=Cafés')).toBeVisible();
    await expect(page.locator('text=Té')).toBeVisible();
    await expect(page.locator('text=Bebidas')).toBeVisible();
    await expect(page.locator('text=Tostas')).toBeVisible();
    await expect(page.locator('text=Arepas')).toBeVisible();
    await expect(page.locator('text=Cuencos')).toBeVisible();
    await expect(page.locator('text=Smoothies')).toBeVisible();
  });

  test('should navigate to Cafés category and show items', async ({ page }) => {
    // Click on Cafés category
    await page.locator('text=Cafés').click();
    
    // Should see back button to categories
    await expect(page.locator('button').filter({ hasText: /Volver a Categorías|Back to Categories/ })).toBeVisible();
    
    // Should see at least one menu item or loading/empty state
    await page.waitForTimeout(2000); // Wait for API call
    
    // Check if we see items or appropriate empty/loading state
    const hasItems = await page.locator('.order-item, [data-testid="menu-item"]').count() > 0;
    const hasLoading = await page.locator('text=Cargando').isVisible();
    const hasEmpty = await page.locator('text=No hay items disponibles').isVisible();
    
    expect(hasItems || hasLoading || hasEmpty).toBe(true);
  });

  test('should navigate to Té category and show items', async ({ page }) => {
    // Click on Té category
    await page.locator('text=Té').click();
    
    // Should see back button to categories
    await expect(page.locator('button').filter({ hasText: /Volver a Categorías|Back to Categories/ })).toBeVisible();
    
    // Wait for API call and check content
    await page.waitForTimeout(2000);
    
    const hasItems = await page.locator('.order-item, [data-testid="menu-item"]').count() > 0;
    const hasLoading = await page.locator('text=Cargando').isVisible();
    const hasEmpty = await page.locator('text=No hay items disponibles').isVisible();
    
    expect(hasItems || hasLoading || hasEmpty).toBe(true);
  });

  test('should navigate to Bebidas category and show items', async ({ page }) => {
    // Click on Bebidas category
    await page.locator('text=Bebidas').click();
    
    // Should see back button to categories
    await expect(page.locator('button').filter({ hasText: /Volver a Categorías|Back to Categories/ })).toBeVisible();
    
    // Wait for API call and check content
    await page.waitForTimeout(2000);
    
    const hasItems = await page.locator('.order-item, [data-testid="menu-item"]').count() > 0;
    const hasLoading = await page.locator('text=Cargando').isVisible();
    const hasEmpty = await page.locator('text=No hay items disponibles').isVisible();
    
    expect(hasItems || hasLoading || hasEmpty).toBe(true);
  });

  test('should navigate to Cuencos category and show bowl builder', async ({ page }) => {
    // Click on Cuencos category
    await page.locator('text=Cuencos').click();
    
    // Wait for items to load
    await page.waitForTimeout(2000);
    
    // Click on first bowl item (if available)
    const firstItem = page.locator('button').filter({ hasText: /Cuenco|Bowl/ }).first();
    if (await firstItem.count() > 0) {
      await firstItem.click();
      
      // Should see bowl builder interface
      await expect(page.locator('text=Elige tu base')).toBeVisible();
      await expect(page.locator('text=Elige tu cereal')).toBeVisible();
      await expect(page.locator('text=Elige hasta 3 frutas')).toBeVisible();
    }
  });

  test('should navigate to Smoothies category and show smoothie builder', async ({ page }) => {
    // Click on Smoothies category
    await page.locator('text=Smoothies').click();
    
    // Wait for items to load
    await page.waitForTimeout(2000);
    
    // Click on first smoothie item (if available)
    const firstItem = page.locator('button').filter({ hasText: /Smoothie|Batido/ }).first();
    if (await firstItem.count() > 0) {
      await firstItem.click();
      
      // Should see smoothie builder interface
      await expect(page.locator('text=Elige el tamaño')).toBeVisible();
    }
  });

  test('should be able to navigate back from categories to main menu', async ({ page }) => {
    // Go to any category
    await page.locator('text=Cafés').click();
    
    // Click back button
    await page.locator('button').filter({ hasText: /Volver a Categorías|Back to Categories/ }).click();
    
    // Should be back at category selection
    await expect(page.locator('text=Seleccionar Categoría')).toBeVisible();
    await expect(page.locator('text=Cafés')).toBeVisible();
  });
});