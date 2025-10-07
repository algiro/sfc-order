import { test, expect } from '@playwright/test';

test.describe('SFC Order Application - Main Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('SFC Order');
  });

  test('should display main navigation buttons', async ({ page }) => {
    // Check that all main navigation buttons are visible
    await expect(page.locator('text=Tomar Pedidos')).toBeVisible();
    await expect(page.locator('text=Lista Cocina')).toBeVisible();
    await expect(page.locator('text=Mesas')).toBeVisible();
    await expect(page.locator('text=Archivo')).toBeVisible();
    
    // Check language toggle button
    await expect(page.locator('button').filter({ hasText: /🇺🇸|🇪🇸/ })).toBeVisible();
  });

  test('should navigate to "Tomar Pedidos" section', async ({ page }) => {
    // Click on "Tomar Pedidos" button
    await page.locator('text=Tomar Pedidos').click();
    
    // Should see table selection
    await expect(page.locator('text=Seleccionar Mesa')).toBeVisible();
    
    // Should see back button
    await expect(page.locator('button').filter({ hasText: /Volver|Back/ })).toBeVisible();
  });

  test('should navigate to "Lista Cocina" section', async ({ page }) => {
    // Click on "Lista Cocina" button
    await page.locator('text=Lista Cocina').click();
    
    // Should see kitchen list header
    await expect(page.locator('text=Lista de Pedidos - Cocina')).toBeVisible();
    
    // Should see back button
    await expect(page.locator('button').filter({ hasText: /Volver|Back/ })).toBeVisible();
  });

  test('should navigate to "Mesas" section', async ({ page }) => {
    // Click on "Mesas" button
    await page.locator('text=Mesas').click();
    
    // Should see table status header
    await expect(page.locator('text=Estado de las Mesas')).toBeVisible();
    
    // Should see back button
    await expect(page.locator('button').filter({ hasText: /Volver|Back/ })).toBeVisible();
  });

  test('should navigate to "Archivo" section', async ({ page }) => {
    // Click on "Archivo" button
    await page.locator('text=Archivo').click();
    
    // Should see archive header
    await expect(page.locator('text=Archivo de Pedidos')).toBeVisible();
    
    // Should see back button
    await expect(page.locator('button').filter({ hasText: /Volver|Back/ })).toBeVisible();
  });

  test('should toggle language', async ({ page }) => {
    // Get initial language state
    const initialButton = await page.locator('button').filter({ hasText: /🇺🇸|🇪🇸/ }).textContent();
    
    // Click language toggle
    await page.locator('button').filter({ hasText: /🇺🇸|🇪🇸/ }).click();
    
    // Wait for page to update
    await page.waitForTimeout(500);
    
    // Check that language changed
    const newButton = await page.locator('button').filter({ hasText: /🇺🇸|🇪🇸/ }).textContent();
    expect(newButton).not.toBe(initialButton);
  });
});