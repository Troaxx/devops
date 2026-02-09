/**
 * Playwright E2E Tests for Gengyue's UPDATE Feature
 * Tests for login form, update form, and UI interactions in real browsers
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5000';

// Helper function to navigate to update section
async function navigateToUpdateSection(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.click('button[onclick="showSection(\'update\')"]');

  const updateSection = page.locator('#update-section');
  await expect(updateSection).toBeVisible();

  return updateSection;
}

test.describe('Gengyue Frontend - UPDATE Feature', () => {

  // ==================== Login Form Tests ====================
  test.describe('Login Form Functionality', () => {

    test('should display error message when student ID is empty', async ({ page }) => {
      await navigateToUpdateSection(page);

      const loginId = page.locator('#login-id');
      const loginForm = page.locator('#login-form');
      const loginMessage = page.locator('#login-message');

      // Remove required attribute to test JavaScript validation
      await page.evaluate(() => {
        document.getElementById('login-id').removeAttribute('required');
      });

      // Clear the input and try to submit
      await loginId.fill('');
      await loginForm.locator('button[type="submit"]').click();

      // Check error message appears
      await expect(loginMessage).toBeVisible();
      await expect(loginMessage).toHaveText('Please enter your Student ID.');
      await expect(loginMessage).toHaveClass(/error/);
    });

    test('should call /api/login endpoint with correct student ID', async ({ page }) => {
      await navigateToUpdateSection(page);

      const loginId = page.locator('#login-id');
      const loginForm = page.locator('#login-form');

      // Listen for API call
      const [request] = await Promise.all([
        page.waitForRequest(request =>
          request.url().includes('/api/login') &&
          request.method() === 'POST'
        ),
        loginId.fill('2403800d'),
        loginForm.locator('button[type="submit"]').click()
      ]);

      // Verify request body
      const requestBody = request.postDataJSON();
      expect(requestBody).toEqual({ id: '2403800d' });
    });

    test('should show update form and populate data on successful login', async ({ page }) => {
      await navigateToUpdateSection(page);

      const loginId = page.locator('#login-id');
      const loginForm = page.locator('#login-form');
      const loginContainer = page.locator('#login-container');
      const updateContainer = page.locator('#update-container');

      // Login with valid student ID
      await loginId.fill('2403800d');
      await loginForm.locator('button[type="submit"]').click();

      // Wait for successful login
      await expect(updateContainer).toBeVisible({ timeout: 5000 });
      await expect(loginContainer).toBeHidden();

      // Check current scores are populated (values depend on database)
      const currentRapid = page.locator('#current-rapid');
      const currentBlitz = page.locator('#current-blitz');
      const currentBullet = page.locator('#current-bullet');

      await expect(currentRapid).not.toHaveText('-');
      await expect(currentBlitz).not.toHaveText('-');
      await expect(currentBullet).not.toHaveText('-');

      // Check form fields are pre-filled
      const newRapid = page.locator('#new-rapid');
      const newBlitz = page.locator('#new-blitz');
      const newBullet = page.locator('#new-bullet');

      await expect(newRapid).not.toHaveValue('');
      await expect(newBlitz).not.toHaveValue('');
      await expect(newBullet).not.toHaveValue('');

      // Check hidden ID field is set
      const updateId = page.locator('#update-id');
      await expect(updateId).toHaveValue('2403800d');
    });

    test('should display error message when login fails with 404', async ({ page }) => {
      await navigateToUpdateSection(page);

      const loginId = page.locator('#login-id');
      const loginForm = page.locator('#login-form');
      const loginMessage = page.locator('#login-message');

      // Try to login with non-existent ID
      await loginId.fill('9999999z');
      await loginForm.locator('button[type="submit"]').click();

      // Check error message
      await expect(loginMessage).toBeVisible({ timeout: 5000 });
      await expect(loginMessage).toHaveText('Student ID not found. Please check your ID and try again.');
      await expect(loginMessage).toHaveClass(/error/);
    });

    test('should handle network error during login', async ({ page }) => {
      await navigateToUpdateSection(page);

      // Simulate network failure
      await page.route('**/api/login', route => route.abort());

      const loginId = page.locator('#login-id');
      const loginForm = page.locator('#login-form');
      const loginMessage = page.locator('#login-message');

      await loginId.fill('2403800d');
      await loginForm.locator('button[type="submit"]').click();

      // Check error message
      await expect(loginMessage).toBeVisible({ timeout: 5000 });
      await expect(loginMessage).toHaveText('Login failed. Please try again.');
      await expect(loginMessage).toHaveClass(/error/);
    });

    test('should trim whitespace from student ID input', async ({ page }) => {
      await navigateToUpdateSection(page);

      const loginId = page.locator('#login-id');
      const loginForm = page.locator('#login-form');

      // Listen for API call
      const [request] = await Promise.all([
        page.waitForRequest(request =>
          request.url().includes('/api/login') &&
          request.method() === 'POST'
        ),
        loginId.fill('  2403800d  '),  // With whitespace
        loginForm.locator('button[type="submit"]').click()
      ]);

      // Verify trimmed ID in request
      const requestBody = request.postDataJSON();
      expect(requestBody).toEqual({ id: '2403800d' });
    });
  });

  // ==================== Update Form Tests ====================
  test.describe('Update Form Functionality', () => {

    // Helper to login before each test
    async function loginFirst(page) {
      await navigateToUpdateSection(page);

      const loginId = page.locator('#login-id');
      const loginForm = page.locator('#login-form');

      await loginId.fill('2403800d');
      await loginForm.locator('button[type="submit"]').click();

      // Wait for update container to be visible
      await page.locator('#update-container').waitFor({ state: 'visible', timeout: 5000 });
    }

    test('should display error when rating fields are empty', async ({ page }) => {
      await loginFirst(page);

      const updateForm = page.locator('#update-form');
      const updateMessage = page.locator('#update-message');

      // Remove required attributes to test JavaScript validation
      await page.evaluate(() => {
        document.getElementById('new-rapid').removeAttribute('required');
        document.getElementById('new-blitz').removeAttribute('required');
        document.getElementById('new-bullet').removeAttribute('required');
      });

      // Clear all fields
      await page.locator('#new-rapid').fill('');
      await page.locator('#new-blitz').fill('');
      await page.locator('#new-bullet').fill('');

      await updateForm.locator('button[type="submit"]').click();

      // Check error message
      await expect(updateMessage).toBeVisible();
      await expect(updateMessage).toHaveText('Please fill in all rating fields.');
      await expect(updateMessage).toHaveClass(/error/);
    });

    test('should call PUT endpoint with correct data on successful update', async ({ page }) => {
      await loginFirst(page);

      const updateForm = page.locator('#update-form');

      // Fill in new scores
      await page.locator('#new-rapid').fill('1300');
      await page.locator('#new-blitz').fill('1250');
      await page.locator('#new-bullet').fill('1200');

      // Listen for PUT request
      const [request] = await Promise.all([
        page.waitForRequest(request =>
          request.url().includes('/api/students/2403800d') &&
          request.method() === 'PUT'
        ),
        updateForm.locator('button[type="submit"]').click()
      ]);

      // Verify request body
      const requestBody = request.postDataJSON();
      expect(requestBody).toEqual({
        rapid: 1300,
        blitz: 1250,
        bullet: 1200
      });
    });

    test('should update displayed current scores after successful update', async ({ page }) => {
      await loginFirst(page);

      const updateForm = page.locator('#update-form');
      const currentRapid = page.locator('#current-rapid');
      const currentBlitz = page.locator('#current-blitz');
      const currentBullet = page.locator('#current-bullet');

      // Fill in new scores
      await page.locator('#new-rapid').fill('1300');
      await page.locator('#new-blitz').fill('1250');
      await page.locator('#new-bullet').fill('1200');

      await updateForm.locator('button[type="submit"]').click();

      // Wait for update to complete and check new values
      await expect(currentRapid).toHaveText('1300', { timeout: 5000 });
      await expect(currentBlitz).toHaveText('1250');
      await expect(currentBullet).toHaveText('1200');
    });

    test('should display success message after update', async ({ page }) => {
      await loginFirst(page);

      const updateForm = page.locator('#update-form');
      const updateMessage = page.locator('#update-message');

      // Fill in new scores
      await page.locator('#new-rapid').fill('1300');
      await page.locator('#new-blitz').fill('1250');
      await page.locator('#new-bullet').fill('1200');

      await updateForm.locator('button[type="submit"]').click();

      // Check success message
      await expect(updateMessage).toBeVisible({ timeout: 5000 });
      await expect(updateMessage).toHaveText('Scores updated successfully!');
      await expect(updateMessage).toHaveClass(/success/);
    });

    test('should handle network error during update', async ({ page }) => {
      await loginFirst(page);

      // Simulate network failure
      await page.route('**/api/students/**', route => route.abort());

      const updateForm = page.locator('#update-form');
      const updateMessage = page.locator('#update-message');

      await page.locator('#new-rapid').fill('1300');
      await page.locator('#new-blitz').fill('1250');
      await page.locator('#new-bullet').fill('1200');

      await updateForm.locator('button[type="submit"]').click();

      // Check error message
      await expect(updateMessage).toBeVisible({ timeout: 5000 });
      await expect(updateMessage).toHaveText('Failed to update scores. Please try again.');
      await expect(updateMessage).toHaveClass(/error/);
    });
  });

  // ==================== Logout Functionality Tests ====================
  test.describe('Logout Functionality', () => {

    async function loginFirst(page) {
      await navigateToUpdateSection(page);

      const loginId = page.locator('#login-id');
      const loginForm = page.locator('#login-form');

      await loginId.fill('2403800d');
      await loginForm.locator('button[type="submit"]').click();

      await page.locator('#update-container').waitFor({ state: 'visible', timeout: 5000 });
    }

    test('should reset to login form on logout', async ({ page }) => {
      await loginFirst(page);

      const loginContainer = page.locator('#login-container');
      const updateContainer = page.locator('#update-container');

      // Call logout function (assuming there's a logout button or we call it via page.evaluate)
      await page.evaluate(() => window.logoutUpdate());

      // Check containers visibility
      await expect(loginContainer).toBeVisible();
      await expect(updateContainer).toBeHidden();
    });

    test('should clear forms on logout', async ({ page }) => {
      await loginFirst(page);

      // Set some values
      await page.locator('#new-rapid').fill('1400');

      // Logout
      await page.evaluate(() => window.logoutUpdate());

      // Check forms are reset
      await expect(page.locator('#login-id')).toHaveValue('');
      await expect(page.locator('#new-rapid')).toHaveValue('');
    });

    test('should hide messages on logout', async ({ page }) => {
      await loginFirst(page);

      const loginMessage = page.locator('#login-message');
      const updateMessage = page.locator('#update-message');

      // Show messages by evaluating directly
      await page.evaluate(() => {
        document.getElementById('login-message').style.display = 'block';
        document.getElementById('update-message').style.display = 'block';
      });

      // Logout
      await page.evaluate(() => window.logoutUpdate());

      // Check messages are hidden
      await expect(loginMessage).toBeHidden();
      await expect(updateMessage).toBeHidden();
    });
  });

  // ==================== Message Display Tests ====================
  test.describe('Message Display Function', () => {

    test('should display success message correctly', async ({ page }) => {
      await navigateToUpdateSection(page);

      const loginMessage = page.locator('#login-message');

      // Call the message function
      await page.evaluate(() => {
        window.showUpdateMessage('login', 'Test success message', 'success');
      });

      // Check message display
      await expect(loginMessage).toBeVisible();
      await expect(loginMessage).toHaveText('Test success message');
      await expect(loginMessage).toHaveClass(/success/);
    });

    test('should display error message correctly', async ({ page }) => {
      await navigateToUpdateSection(page);

      // Make update container visible so message can be seen
      await page.evaluate(() => {
        document.getElementById('update-container').style.display = 'block';
      });

      const updateMessage = page.locator('#update-message');

      await page.evaluate(() => {
        window.showUpdateMessage('update', 'Test error message', 'error');
      });

      // Wait for message to be visible
      await updateMessage.waitFor({ state: 'visible', timeout: 5000 });
      await expect(updateMessage).toHaveText('Test error message');
      await expect(updateMessage).toHaveClass(/error/);
    });

    test('should auto-hide success messages after timeout', async ({ page }) => {
      await navigateToUpdateSection(page);

      const loginMessage = page.locator('#login-message');

      await page.evaluate(() => {
        window.showUpdateMessage('login', 'Auto-hide test', 'success');
      });

      // Message should be visible initially
      await loginMessage.waitFor({ state: 'visible', timeout: 5000 });

      // Wait for auto-hide (5 seconds + buffer)
      await page.waitForTimeout(5200);

      // Message should be hidden
      await expect(loginMessage).toBeHidden();
    });

    test('should not auto-hide error messages', async ({ page }) => {
      await navigateToUpdateSection(page);

      // Make update container visible so message can be seen
      await page.evaluate(() => {
        document.getElementById('update-container').style.display = 'block';
      });

      const updateMessage = page.locator('#update-message');

      await page.evaluate(() => {
        window.showUpdateMessage('update', 'Error stays', 'error');
      });

      // Message should be visible
      await updateMessage.waitFor({ state: 'visible', timeout: 5000 });

      // Wait some time
      await page.waitForTimeout(2000);

      // Should still be visible
      await expect(updateMessage).toBeVisible();
    });
  });
});
