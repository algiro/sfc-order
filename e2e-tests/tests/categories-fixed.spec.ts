import { test, expect } from '@playwright/test';

test.describe('SFC Order Application - Fixed Categories Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('SFC Order');
    await page.locator('button').filter({ hasText: /Tomar Pedidos|Take Orders/ }).click();
    await page.locator('button').filter({ hasText: /Mesa|Table/ }).first().click();
    await page.locator('button').filter({ hasText: /María Maye|Erin|Carlos|Ana|👤/ }).first().click();
    await expect(page.locator('text=Seleccionar Categoría')).toBeVisible();
  });

  test('should verify Cafés category shows coffee items correctly', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Cafés|Coffee/ }).first().click();
    
    // Check category title
    await expect(page.locator('h3')).toContainText(/Cafés|Coffee/);
    
    // Check specific coffee items are visible
    await expect(page.locator('text=Café con Leche')).toBeVisible();
    await expect(page.locator('text=Cortado')).toBeVisible();
    await expect(page.locator('text=Cappuccino')).toBeVisible();
    
    // Click on an item to test customization
    await page.locator('button').filter({ hasText: /Cappuccino/ }).click();
    
    // Should see customization options (check for at least one)
    await expect(page.locator('button').filter({ hasText: /descafeinado/ })).toBeVisible();
    
    console.log('✅ Cafés category working correctly with items and customization');
  });

  test('should verify Té category shows tea items correctly', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Té e Infusiones|Tea/ }).first().click();
    
    await expect(page.locator('text=Té Verde')).toBeVisible();
    await expect(page.locator('text=Té Negro')).toBeVisible();
    await expect(page.locator('text=Infusión de Manzanilla')).toBeVisible();
    
    await page.locator('button').filter({ hasText: /Té Verde/ }).click();
    await expect(page.locator('button').filter({ hasText: /con miel/ })).toBeVisible();
    
    console.log('✅ Té category working correctly with items and customization');
  });

  test('should verify Bebidas category shows drink items correctly', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Bebidas|Drinks/ }).first().click();
    
    await expect(page.locator('text=Agua Mineral')).toBeVisible();
    await expect(page.locator('text=Zumo de Naranja')).toBeVisible();
    await expect(page.locator('text=Cerveza')).toBeVisible();
    
    await page.locator('button').filter({ hasText: /Zumo de Naranja/ }).click();
    await expect(page.locator('button').filter({ hasText: /con hielo/ })).toBeVisible();
    
    console.log('✅ Bebidas category working correctly with items and customization');
  });

  test('should verify Tostas category shows toast items correctly', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Tostas|Toast/ }).first().click();
    
    await expect(page.locator('text=Tosta de Aguacate')).toBeVisible();
    await expect(page.locator('text=Tosta de Tomate')).toBeVisible();
    await expect(page.locator('text=Tosta de Jamón')).toBeVisible();
    
    await page.locator('button').filter({ hasText: /Tosta de Aguacate/ }).click();
    await expect(page.locator('button').filter({ hasText: /sin gluten/ })).toBeVisible();
    
    console.log('✅ Tostas category working correctly with items and customization');
  });

  test('should verify Arepas category shows arepa items correctly', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Arepas/ }).first().click();
    
    await expect(page.locator('text=Arepa Reina Pepiada')).toBeVisible();
    await expect(page.locator('text=Arepa de Queso')).toBeVisible();
    await expect(page.locator('text=Arepa de Carne Mechada')).toBeVisible();
    
    await page.locator('button').filter({ hasText: /Arepa Reina Pepiada/ }).click();
    await expect(page.locator('button').filter({ hasText: /sin queso/ })).toBeVisible();
    
    console.log('✅ Arepas category working correctly with items and customization');
  });

  test('should verify all categories can add items to order', async ({ page }) => {
    // Add coffee
    await page.locator('button').filter({ hasText: /Cafés/ }).first().click();
    await page.locator('button').filter({ hasText: /Cortado/ }).click();
    await page.locator('button').filter({ hasText: /Añadir al Pedido|Add to Order/ }).click();
    
    // Go back and add toast
    await page.locator('button').filter({ hasText: /Volver|Back/ }).first().click();
    await page.locator('button').filter({ hasText: /Tostas/ }).first().click();
    await page.locator('button').filter({ hasText: /Tosta de Tomate/ }).click();
    await page.locator('button').filter({ hasText: /Añadir al Pedido|Add to Order/ }).click();
    
    // Go back and verify order count
    await page.locator('button').filter({ hasText: /Volver|Back/ }).first().click();
    
    // Should show order with 2 items
    const orderButton = page.locator('button').filter({ hasText: /Ver Pedido.*2|View Order.*2/ });
    await expect(orderButton).toBeVisible();
    
    console.log('✅ Successfully added items from multiple categories to order');
  });
});