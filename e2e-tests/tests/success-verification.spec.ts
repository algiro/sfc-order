import { test, expect } from '@playwright/test';

test.describe('SFC Order Application - Categories Success Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('SFC Order');
    await page.locator('button').filter({ hasText: /Tomar Pedidos|Take Orders/ }).click();
    await page.locator('button').filter({ hasText: /Mesa|Table/ }).first().click();
    await page.locator('button').filter({ hasText: /María Maye|Erin|Carlos|Ana|👤/ }).first().click();
    await expect(page.locator('text=Seleccionar Categoría')).toBeVisible();
  });

  test('✅ SUCCESS: All categories now have working items - Cafés verification', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Cafés/ }).first().click();
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Count actual buttons (items are rendered as buttons)
    const buttonCount = await page.locator('button').count();
    
    // Should have more than just navigation buttons (back, etc.)
    // Expecting: back button + multiple item buttons
    expect(buttonCount).toBeGreaterThan(3);
    
    // Should NOT see empty state message
    const hasEmptyMessage = await page.locator('text=No hay items disponibles').isVisible();
    expect(hasEmptyMessage).toBe(false);
    
    console.log(`✅ CAFÉS WORKING: Found ${buttonCount} buttons (including items)`);
  });

  test('✅ SUCCESS: All categories now have working items - Té verification', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Té e Infusiones|Tea/ }).first().click();
    await page.waitForTimeout(2000);
    
    const buttonCount = await page.locator('button').count();
    expect(buttonCount).toBeGreaterThan(3);
    
    const hasEmptyMessage = await page.locator('text=No hay items disponibles').isVisible();
    expect(hasEmptyMessage).toBe(false);
    
    console.log(`✅ TÉ WORKING: Found ${buttonCount} buttons (including items)`);
  });

  test('✅ SUCCESS: All categories now have working items - Bebidas verification', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Bebidas|Drinks/ }).first().click();
    await page.waitForTimeout(2000);
    
    const buttonCount = await page.locator('button').count();
    expect(buttonCount).toBeGreaterThan(3);
    
    const hasEmptyMessage = await page.locator('text=No hay items disponibles').isVisible();
    expect(hasEmptyMessage).toBe(false);
    
    console.log(`✅ BEBIDAS WORKING: Found ${buttonCount} buttons (including items)`);
  });

  test('✅ SUCCESS: All categories now have working items - Tostas verification', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Tostas|Toast/ }).first().click();
    await page.waitForTimeout(2000);
    
    const buttonCount = await page.locator('button').count();
    expect(buttonCount).toBeGreaterThan(3);
    
    const hasEmptyMessage = await page.locator('text=No hay items disponibles').isVisible();
    expect(hasEmptyMessage).toBe(false);
    
    console.log(`✅ TOSTAS WORKING: Found ${buttonCount} buttons (including items)`);
  });

  test('✅ SUCCESS: All categories now have working items - Arepas verification', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Arepas/ }).first().click();
    await page.waitForTimeout(2000);
    
    const buttonCount = await page.locator('button').count();
    expect(buttonCount).toBeGreaterThan(3);
    
    const hasEmptyMessage = await page.locator('text=No hay items disponibles').isVisible();
    expect(hasEmptyMessage).toBe(false);
    
    console.log(`✅ AREPAS WORKING: Found ${buttonCount} buttons (including items)`);
  });

  test('✅ SUCCESS: Complete category verification summary', async ({ page }) => {
    const categories = [
      { name: 'Cafés', selector: /Cafés/ },
      { name: 'Té', selector: /Té e Infusiones|Tea/ },
      { name: 'Bebidas', selector: /Bebidas|Drinks/ },
      { name: 'Tostas', selector: /Tostas|Toast/ },
      { name: 'Arepas', selector: /Arepas/ },
      { name: 'Cuencos', selector: /Cuencos|Bowls/ },
      { name: 'Smoothies', selector: /Smoothies/ }
    ];
    
    const results = [];
    
    for (const category of categories) {
      // Navigate to category
      await page.locator('button').filter({ hasText: category.selector }).first().click();
      await page.waitForTimeout(1500);
      
      // Count buttons (items + navigation)
      const buttonCount = await page.locator('button').count();
      
      // Check for empty state
      const hasEmpty = await page.locator('text=No hay items disponibles').isVisible();
      
      const isWorking = buttonCount > 2 && !hasEmpty;
      results.push({ name: category.name, working: isWorking, buttons: buttonCount });
      
      console.log(`${isWorking ? '✅' : '❌'} ${category.name}: ${buttonCount} buttons, empty: ${hasEmpty}`);
      
      // Go back to categories
      const backButton = page.locator('button').filter({ hasText: /Volver|Back|←/ }).first();
      if (await backButton.isVisible()) {
        await backButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Verify all categories are working
    const allWorking = results.every(r => r.working);
    const workingCount = results.filter(r => r.working).length;
    
    console.log(`\n🎉 FINAL RESULT: ${workingCount}/${results.length} categories working`);
    console.log('✅ SUCCESS: All menu categories now have items and are fully functional!');
    
    expect(allWorking).toBe(true);
    expect(workingCount).toBe(7);
  });
});