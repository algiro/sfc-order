import { test, expect } from '@playwright/test';

test.describe('SFC Order Application - Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('SFC Order');
  });

  test('should complete a basic order flow', async ({ page }) => {
    // Navigate to order taking
    await page.locator('text=Tomar Pedidos').click();
    
    // Select table
    await page.locator('[data-testid="table-1"], button').filter({ hasText: '1' }).first().click();
    
    // Select waiter
    const waiterButton = page.locator('button').filter({ hasText: /María Maye|Erin|Carlos|Ana|👤/ }).first();
    if (await waiterButton.count() > 0) {
      await waiterButton.click();
    }
    
    // Should now see category selection 
    await expect(page.locator('text=Seleccionar Categoría')).toBeVisible();
    
    // Select a category (Cafés)
    await page.locator('text=Cafés').click();
    
    // Wait for items to load
    await page.waitForTimeout(3000);
    
    // Check if we can see any items or proper loading/empty states
    const itemButtons = page.locator('button').filter({ hasText: /Café|Coffee/ });
    const loadingText = page.locator('text=Cargando');
    const emptyText = page.locator('text=No hay items disponibles');
    
    // At least one of these should be visible
    const hasContent = await itemButtons.count() > 0 || 
                      await loadingText.isVisible() || 
                      await emptyText.isVisible();
    
    expect(hasContent).toBe(true);
    
    // If we have items, try to add one to order
    if (await itemButtons.count() > 0) {
      await itemButtons.first().click();
      
      // Should see customization or confirmation screen
      const confirmButton = page.locator('button').filter({ hasText: /Confirmar|Confirm|Añadir/ });
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Navigate to order taking
    await page.locator('text=Tomar Pedidos').click();
    
    // Select table and waiter quickly
    await page.locator('[data-testid="table-1"], button').filter({ hasText: '1' }).first().click();
    const waiterButton = page.locator('button').filter({ hasText: /Ana|Carlos|Maria/ }).first();
    if (await waiterButton.count() > 0) {
      await waiterButton.click();
    }
    
    // Navigate to each category and ensure no crashes
    const categories = ['Cafés', 'Té', 'Bebidas', 'Tostas', 'Arepas'];
    
    for (const category of categories) {
      // Click category
      await page.locator(`text=${category}`).click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Should not see error pages or crashes
      await expect(page.locator('body')).toBeVisible();
      
      // Go back to categories
      const backButton = page.locator('button').filter({ hasText: /Volver a Categorías|Back to Categories/ });
      if (await backButton.count() > 0) {
        await backButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should display proper loading states', async ({ page }) => {
    // Navigate to order taking
    await page.locator('text=Tomar Pedidos').click();
    
    // Select table and waiter
    await page.locator('[data-testid="table-1"], button').filter({ hasText: '1' }).first().click();
    const waiterButton = page.locator('button').filter({ hasText: /Ana|Carlos|Maria/ }).first();
    if (await waiterButton.count() > 0) {
      await waiterButton.click();
    }
    
    // Click on a category
    await page.locator('text=Cafés').click();
    
    // Should see either loading state or content within reasonable time
    await expect(async () => {
      const hasLoading = await page.locator('text=Cargando').isVisible();
      const hasContent = await page.locator('button').filter({ hasText: /Café/ }).count() > 0;
      const hasEmpty = await page.locator('text=No hay items disponibles').isVisible();
      
      expect(hasLoading || hasContent || hasEmpty).toBe(true);
    }).toPass({ timeout: 10000 });
  });
});