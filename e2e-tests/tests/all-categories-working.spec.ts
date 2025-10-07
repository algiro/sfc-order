import { test, expect } from '@playwright/test';

test.describe('SFC Order Application - All Categories Working Tests', () => {
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

  test('should display and navigate Cafés category with all coffee items', async ({ page }) => {
    // Navigate to Cafés category
    const cafesButton = page.locator('button').filter({ hasText: /Cafés|Coffee/ }).first();
    await expect(cafesButton).toBeVisible();
    await cafesButton.click();
    
    // Should see category title
    await expect(page.locator('h3').filter({ hasText: /Cafés|Coffee/ })).toBeVisible();
    
    // Should see coffee items
    await expect(page.locator('text=Café con Leche')).toBeVisible();
    await expect(page.locator('text=Cortado')).toBeVisible();
    await expect(page.locator('text=Cappuccino')).toBeVisible();
    await expect(page.locator('text=Americano')).toBeVisible();
    await expect(page.locator('text=Café Solo')).toBeVisible();
    
    // Should see prices
    await expect(page.locator('text=€2.50')).toBeVisible();
    await expect(page.locator('text=€2.20')).toBeVisible();
    
    // Test item selection
    await page.locator('text=Cappuccino').click();
    await expect(page.locator('text=Cappuccino')).toBeVisible();
    await expect(page.locator('text=€2.80')).toBeVisible();
    
    // Should have customization options
    await expect(page.locator('text=/descafeinado|con avena|con soja/i')).toBeVisible();
  });

  test('should display and navigate Té category with all tea items', async ({ page }) => {
    // Navigate to Té category
    const teButton = page.locator('button').filter({ hasText: /Té e Infusiones|Tea.*Infusions|Té|Tea/ }).first();
    await expect(teButton).toBeVisible();
    await teButton.click();
    
    // Should see tea items
    await expect(page.locator('text=Té Verde')).toBeVisible();
    await expect(page.locator('text=Té Negro')).toBeVisible();
    await expect(page.locator('text=Infusión de Manzanilla')).toBeVisible();
    await expect(page.locator('text=Infusión de Poleo')).toBeVisible();
    await expect(page.locator('text=Té Rojo')).toBeVisible();
    
    // Test item selection
    await page.locator('text=Té Verde').click();
    await expect(page.locator('text=Té Verde')).toBeVisible();
    await expect(page.locator('text=€2.10')).toBeVisible();
    
    // Should have customization options
    await expect(page.locator('text=/con miel|con limón|muy caliente/i')).toBeVisible();
  });

  test('should display and navigate Bebidas category with all drink items', async ({ page }) => {
    // Navigate to Bebidas category
    const bebidasButton = page.locator('button').filter({ hasText: /Bebidas|Drinks/ }).first();
    await expect(bebidasButton).toBeVisible();
    await bebidasButton.click();
    
    // Should see drink items
    await expect(page.locator('text=Agua Mineral')).toBeVisible();
    await expect(page.locator('text=Zumo de Naranja')).toBeVisible();
    await expect(page.locator('text=Refresco de Cola')).toBeVisible();
    await expect(page.locator('text=Cerveza')).toBeVisible();
    await expect(page.locator('text=Agua con Gas')).toBeVisible();
    
    // Test item selection
    await page.locator('text=Zumo de Naranja').click();
    await expect(page.locator('text=Zumo de Naranja')).toBeVisible();
    await expect(page.locator('text=€3.20')).toBeVisible();
    
    // Should have customization options
    await expect(page.locator('text=/con hielo|sin hielo|con limón/i')).toBeVisible();
  });

  test('should display and navigate Tostas category with all toast items', async ({ page }) => {
    // Navigate to Tostas category
    const tostasButton = page.locator('button').filter({ hasText: /Tostas|Toast/ }).first();
    await expect(tostasButton).toBeVisible();
    await tostasButton.click();
    
    // Should see toast items
    await expect(page.locator('text=Tosta de Aguacate')).toBeVisible();
    await expect(page.locator('text=Tosta de Tomate')).toBeVisible();
    await expect(page.locator('text=Tosta de Jamón')).toBeVisible();
    await expect(page.locator('text=Tosta de Queso')).toBeVisible();
    
    // Test item selection
    await page.locator('text=Tosta de Aguacate').click();
    await expect(page.locator('text=Tosta de Aguacate')).toBeVisible();
    await expect(page.locator('text=€5.50')).toBeVisible();
    
    // Should have customization options
    await expect(page.locator('text=/sin gluten|más tostada|menos tostada/i')).toBeVisible();
  });

  test('should display and navigate Arepas category with all arepa items', async ({ page }) => {
    // Navigate to Arepas category
    const arepasButton = page.locator('button').filter({ hasText: /Arepas/ }).first();
    await expect(arepasButton).toBeVisible();
    await arepasButton.click();
    
    // Should see arepa items
    await expect(page.locator('text=Arepa Reina Pepiada')).toBeVisible();
    await expect(page.locator('text=Arepa de Queso')).toBeVisible();
    await expect(page.locator('text=Arepa de Carne Mechada')).toBeVisible();
    await expect(page.locator('text=Arepa de Pernil')).toBeVisible();
    
    // Test item selection
    await page.locator('text=Arepa Reina Pepiada').click();
    await expect(page.locator('text=Arepa Reina Pepiada')).toBeVisible();
    await expect(page.locator('text=€7.50')).toBeVisible();
    
    // Should have customization options
    await expect(page.locator('text=/sin queso|extra queso|sin cebolla/i')).toBeVisible();
  });

  test('should allow adding items from different categories to order', async ({ page }) => {
    // Add a coffee
    await page.locator('button').filter({ hasText: /Cafés|Coffee/ }).first().click();
    await page.locator('text=Cappuccino').click();
    await page.locator('button').filter({ hasText: /Añadir al Pedido|Add to Order/ }).click();
    
    // Go back to categories
    await page.locator('button').filter({ hasText: /Volver|Back|←/ }).first().click();
    
    // Add a toast
    await page.locator('button').filter({ hasText: /Tostas|Toast/ }).first().click();
    await page.locator('text=Tosta de Aguacate').click();
    await page.locator('button').filter({ hasText: /Añadir al Pedido|Add to Order/ }).click();
    
    // Go back to categories  
    await page.locator('button').filter({ hasText: /Volver|Back|←/ }).first().click();
    
    // Should see order summary button with count
    await expect(page.locator('button').filter({ hasText: /Ver Pedido.*2|View Order.*2/ })).toBeVisible();
    
    // View order summary
    await page.locator('button').filter({ hasText: /Ver Pedido|View Order/ }).click();
    
    // Should see both items in order
    await expect(page.locator('text=Cappuccino')).toBeVisible();
    await expect(page.locator('text=Tosta de Aguacate')).toBeVisible();
  });

  test('should verify all categories are accessible from main menu', async ({ page }) => {
    // Check all category buttons are visible and clickable
    const categories = [
      { text: /Cafés|Coffee/, name: 'Cafés' },
      { text: /Té e Infusiones|Tea.*Infusions|Té|Tea/, name: 'Té' },
      { text: /Bebidas|Drinks/, name: 'Bebidas' },
      { text: /Tostas|Toast/, name: 'Tostas' },
      { text: /Arepas/, name: 'Arepas' },
      { text: /Cuencos|Bowls/, name: 'Cuencos' },
      { text: /Smoothies/, name: 'Smoothies' }
    ];
    
    for (const category of categories) {
      const button = page.locator('button').filter({ hasText: category.text }).first();
      await expect(button).toBeVisible();
      
      console.log(`✅ ${category.name} category button is visible and accessible`);
    }
    
    // Test navigation to each category
    for (const category of categories) {
      const button = page.locator('button').filter({ hasText: category.text }).first();
      await button.click();
      
      // Wait a moment for content to load
      await page.waitForTimeout(1000);
      
      // Should see some content (either items or builder interface)
      const hasContent = await page.locator('button, [class*=\"item\"], [class*=\"builder\"], [class*=\"grid\"]').count();
      
      if (hasContent === 0) {
        throw new Error(`${category.name} category appears to have no content`);
      }
      
      console.log(`✅ ${category.name} category loads content successfully (${hasContent} elements)`);
      
      // Go back to main menu
      const backButton = page.locator('button').filter({ hasText: /Volver|Back|←/ }).first();
      if (await backButton.isVisible()) {
        await backButton.click();
      } else {
        // If no back button, navigate back to categories manually
        await page.locator('button').filter({ hasText: /Nueva Mesa|New Table/ }).first().click();
        await page.locator('button').filter({ hasText: /Mesa|Table/ }).first().click();
        await page.locator('button').filter({ hasText: /María Maye|Erin|Carlos|Ana|👤/ }).first().click();
      }
      
      // Ensure we're back at category selection
      await expect(page.locator('text=Seleccionar Categoría')).toBeVisible();
    }
  });
});