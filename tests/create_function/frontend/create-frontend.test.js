const { test, expect } = require('@playwright/test');
const { startCoverage, stopCoverage, saveCoverageReport } = require('../../coverage-helper');

test.describe('Create Frontend Tests - Daniella', () => {
  test.beforeEach(async ({ page, browserName }) => {
    // Start coverage only for Chromium
    if (browserName === 'chromium') {
      await startCoverage(page);
    }
    await page.goto('/');
    await page.click('button:has-text("Create Account")');
    await page.waitForSelector('#create-section.active');
    await page.waitForTimeout(500);
  });

  test.afterEach(async ({ page, browserName }, testInfo) => {
    // Stop coverage only for Chromium
    if (browserName === 'chromium') {
      await stopCoverage(page);
    }
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot();
      await testInfo.attach('screenshot', {
        body: screenshot,
        contentType: 'image/png',
      });
    }
  });

  // Save cumulative coverage report after all tests in this file
  test.afterAll(() => {
    saveCoverageReport();
  });

  test.describe('Test Suite 1: Input Validation & Error Handling', () => {
    test('should show error message for empty student ID', async ({ page }) => {
      await page.fill('#rapid-score', '1200');
      await page.fill('#blitz-score', '1150');
      await page.fill('#bullet-score', '1100');
      // Remove required attributes to test JS validation
      await page.$eval('#create-form', form => {
        Array.from(form.querySelectorAll('input')).forEach(input => input.removeAttribute('required'));
      });
      await page.click('button[type="submit"]');

      const message = page.locator('#create-message');
      await expect(message).toBeVisible();
      await expect(message).toContainText('Please enter a student ID');
      await expect(message).toHaveClass(/error/);
    });

    test('should show error message for invalid ID format', async ({ page }) => {
      await page.fill('#student-id', 'invalid-id');
      await page.fill('#rapid-score', '1200');
      await page.fill('#blitz-score', '1150');
      await page.fill('#bullet-score', '1100');
      await page.click('button[type="submit"]');

      const message = page.locator('#create-message');
      await expect(message).toBeVisible();
      await expect(message).toContainText('Invalid ID format');
      await expect(message).toHaveClass(/error/);
    });

    test('should show error message for missing rating fields (Rapid)', async ({ page }) => {
      const testId = `240${Math.floor(1000 + Math.random() * 9000)}a`;
      await page.fill('#student-id', testId);
      // Rapid missing
      await page.fill('#blitz-score', '1150');
      await page.fill('#bullet-score', '1100');

      await page.$eval('#create-form', form => {
        Array.from(form.querySelectorAll('input')).forEach(input => input.removeAttribute('required'));
      });
      await page.click('button[type="submit"]');

      const message = page.locator('#create-message');
      await expect(message).toBeVisible();
      await expect(message).toContainText('Please fill in all rating fields');
    });

    test('should show error message for missing rating fields (Blitz)', async ({ page }) => {
      const testId = `240${Math.floor(1000 + Math.random() * 9000)}a`;
      await page.fill('#student-id', testId);
      await page.fill('#rapid-score', '1200');
      // Blitz missing
      await page.fill('#bullet-score', '1100');

      await page.$eval('#create-form', form => {
        Array.from(form.querySelectorAll('input')).forEach(input => input.removeAttribute('required'));
      });
      await page.click('button[type="submit"]');

      const message = page.locator('#create-message');
      await expect(message).toBeVisible();
      await expect(message).toContainText('Please fill in all rating fields');
    });

    test('should show error message for missing rating fields (Bullet)', async ({ page }) => {
      const testId = `240${Math.floor(1000 + Math.random() * 9000)}a`;
      await page.fill('#student-id', testId);
      await page.fill('#rapid-score', '1200');
      await page.fill('#blitz-score', '1150');
      // Bullet missing

      await page.$eval('#create-form', form => {
        Array.from(form.querySelectorAll('input')).forEach(input => input.removeAttribute('required'));
      });
      await page.click('button[type="submit"]');

      const message = page.locator('#create-message');
      await expect(message).toBeVisible();
      await expect(message).toContainText('Please fill in all rating fields');
    });

    test('should handle network error during creation', async ({ page }) => {
      await page.fill('#student-id', '2409999e');
      await page.fill('#rapid-score', '1000');
      await page.fill('#blitz-score', '1000');
      await page.fill('#bullet-score', '1000');

      // Abort the request to simulate network failure
      await page.route('/api/students', route => route.abort());

      await page.click('button[type="submit"]');

      const message = page.locator('#create-message');
      await expect(message).toBeVisible();
      await expect(message).toHaveClass(/error/);
      await expect(message).toContainText('Failed to create account');
    });

    test('should show error message for duplicate student ID', async ({ page }) => {
      const testId = `240${Math.floor(1000 + Math.random() * 9000)}a`;

      // 1. Create the first student
      await page.fill('#student-id', testId);
      await page.fill('#rapid-score', '1200');
      await page.fill('#blitz-score', '1150');
      await page.fill('#bullet-score', '1100');

      // Wait for success response (201)
      const successResponsePromise = page.waitForResponse(response =>
        response.url().includes('/api/students') &&
        response.request().method() === 'POST' &&
        response.status() === 201
      );

      await page.click('button[type="submit"]');
      await successResponsePromise;

      // Verify success state AND that form is reset
      await expect(page.locator('#create-message')).toHaveClass(/success/);
      await expect(page.locator('#student-id')).toHaveValue('');

      // Wait for form to stabilize (fixes WebKit/Windows file timing issues that causes flakiness)
      await page.waitForTimeout(2000);

      // 2. Try to create the SAME student again
      await page.fill('#student-id', testId);
      await page.fill('#rapid-score', '1300');
      await page.fill('#blitz-score', '1250');
      await page.fill('#bullet-score', '1200');

      // Wait for ANY response (creates a race-proof assertion)
      const errorResponsePromise = page.waitForResponse(response =>
        response.url().includes('/api/students') &&
        response.request().method() === 'POST'
      );

      await page.click('button[type="submit"]');
      const errorResponse = await errorResponsePromise;

      // Verify status code explicitly (fails fast instead of timeout)
      expect(errorResponse.status()).toBe(409);

      // 3. Verify error message
      const errorMessage = page.locator('#create-message');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('already exists');
      await expect(errorMessage).toHaveClass(/error/);
    });

    test('should validate ID format pattern (7 digits + letter a-e)', async ({ page }) => {
      const invalidIds = ['1234567', '12345678', '1234567z', 'abcdefgh'];

      for (const invalidId of invalidIds) {
        await page.fill('#student-id', invalidId);
        await page.fill('#rapid-score', '1200');
        await page.fill('#blitz-score', '1150');
        await page.fill('#bullet-score', '1100');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);

        const message = page.locator('#create-message');
        await expect(message).toContainText('Invalid ID format');

        await page.fill('#student-id', '');
      }
    });
  });

  test.describe('Test Suite 2: Successful Student Creation', () => {
    test('should successfully create student with valid data', async ({ page }) => {
      const testId = `240${Math.floor(1000 + Math.random() * 9000)}a`;

      await page.fill('#student-id', testId);
      await page.fill('#rapid-score', '1200');
      await page.fill('#blitz-score', '1150');
      await page.fill('#bullet-score', '1100');

      const responsePromise = page.waitForResponse(response =>
        response.url().includes('/api/students') && response.request().method() === 'POST'
      );

      await page.click('button[type="submit"]');
      await responsePromise;

      const message = page.locator('#create-message');
      await expect(message).toBeVisible();
      await expect(message).toContainText('successfully');
      await expect(message).toHaveClass(/success/);

      await expect(page.locator('#student-id')).toHaveValue('');
    });

    test('should accept valid ID format', async ({ page }) => {
      // Generate unique base numbers for each suffix to ensure uniqueness
      const validIds = [
        `240${Math.floor(1000 + Math.random() * 9000)}a`,
        `240${Math.floor(1000 + Math.random() * 9000)}b`,
        `240${Math.floor(1000 + Math.random() * 9000)}c`,
        `240${Math.floor(1000 + Math.random() * 9000)}d`,
        `240${Math.floor(1000 + Math.random() * 9000)}e`
      ];

      for (const validId of validIds) {
        await page.fill('#student-id', validId);
        await page.fill('#rapid-score', '1200');
        await page.fill('#blitz-score', '1150');
        await page.fill('#bullet-score', '1100');

        const responsePromise = page.waitForResponse(response =>
          response.url().includes('/api/students') && response.request().method() === 'POST'
        );

        await page.click('button[type="submit"]');
        await responsePromise;
        await page.waitForTimeout(500);

        const message = page.locator('#create-message');

        // We still check just in case, but random IDs should minimize this
        const messageText = await message.textContent();
        if (messageText.includes('already exists')) {
          // Retry with another random ID if we got super unlucky
          const retryId = `241${Math.floor(1000 + Math.random() * 9000)}a`;
          await page.fill('#student-id', retryId);
          await page.click('button[type="submit"]');
          await page.waitForTimeout(500);
        }

        await expect(message).toContainText('successfully');

        // Clear form for next iteration
        await page.goto('/');
        await page.click('button:has-text("Create Account")');
        await page.waitForSelector('#create-section.active');
      }
    });
    test('should trigger loadRankings if defined', async ({ page }) => {
      // Inject a mock function for loadRankings
      await page.evaluate(() => {
        window.loadRankings = () => { window.rankingsReloaded = true; };
      });

      const testId = `240${Math.floor(1000 + Math.random() * 9000)}e`;
      await page.fill('#student-id', testId);
      await page.fill('#rapid-score', '1200');
      await page.fill('#blitz-score', '1150');
      await page.fill('#bullet-score', '1100');

      const responsePromise = page.waitForResponse(response =>
        response.url().includes('/api/students') && response.request().method() === 'POST'
      );

      await page.click('button[type="submit"]');
      await responsePromise;

      // Wait for the timeout in the code (500ms) plus buffer
      await page.waitForTimeout(1000);

      const reloaded = await page.evaluate(() => window.rankingsReloaded);
      expect(reloaded).toBe(true);
    });
  });

  test.describe('Test Suite 3: UI Behavior & Feedback', () => {
    test('should display create form with all required fields', async ({ page }) => {
      await expect(page.locator('#student-id')).toBeVisible();
      await expect(page.locator('#rapid-score')).toBeVisible();
      await expect(page.locator('#blitz-score')).toBeVisible();
      await expect(page.locator('#bullet-score')).toBeVisible();
      const submitBtn = page.locator('#create-form button[type="submit"]');
      await submitBtn.evaluate(el => el.scrollIntoView());
      await expect(submitBtn).toBeVisible();
    });

    test('should reset form after successful creation', async ({ page }) => {
      const testId = `240${Math.floor(1000 + Math.random() * 9000)}a`;

      await page.fill('#student-id', testId);
      await page.fill('#rapid-score', '1200');
      await page.fill('#blitz-score', '1150');
      await page.fill('#bullet-score', '1100');

      const responsePromise = page.waitForResponse(response =>
        response.url().includes('/api/students') && response.request().method() === 'POST'
      );

      await page.click('button[type="submit"]');
      await responsePromise;
      await page.waitForTimeout(500);

      await expect(page.locator('#student-id')).toHaveValue('');
      await expect(page.locator('#rapid-score')).toHaveValue('');
      await expect(page.locator('#blitz-score')).toHaveValue('');
      await expect(page.locator('#bullet-score')).toHaveValue('');
    });

    test('should auto-hide success message after 5 seconds', async ({ page }) => {
      const testId = `240${Math.floor(1000 + Math.random() * 9000)}a`;

      await page.fill('#student-id', testId);
      await page.fill('#rapid-score', '1200');
      await page.fill('#blitz-score', '1150');
      await page.fill('#bullet-score', '1100');

      const responsePromise = page.waitForResponse(response =>
        response.url().includes('/api/students') && response.request().method() === 'POST'
      );

      await page.click('button[type="submit"]');
      await responsePromise;

      const message = page.locator('#create-message');
      // Scroll into view for mobile viewports
      await message.scrollIntoViewIfNeeded();
      await expect(message).toBeVisible();
      await expect(message).toHaveClass(/success/);

      // Wait for auto-hide timer (5 seconds + buffer)
      await page.waitForTimeout(6000);
      await expect(message).toBeHidden();
    });
  });
});
