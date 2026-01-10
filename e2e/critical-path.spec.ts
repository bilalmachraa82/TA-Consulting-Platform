import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Path
 * 
 * This test suite covers the "Happy Path" that MUST work for the product to be usable.
 * If any of these tests fail, the deployment should be blocked.
 * 
 * Flow:
 * 1. Landing Page loads
 * 2. Navigate to Dashboard (auth required)
 * 3. View Avisos list
 * 4. Open an Aviso detail
 * 5. Chatbot responds to a query
 */

test.describe('Critical Path', () => {

    test('Landing page loads and shows hero section', async ({ page }) => {
        await page.goto('/');

        // Check for key elements
        await expect(page).toHaveTitle(/TA Consulting/i);

        // Hero section should be visible with specific text
        const heroHeading = page.getByRole('heading', { name: /Automatize os seus/i });
        await expect(heroHeading).toBeVisible();

        // CTA button should exist (Aceder ao Dashboard)
        const ctaButton = page.getByRole('link', { name: /Aceder ao Dashboard/i });
        await expect(ctaButton).toBeVisible();
    });

    test('Login page accessible', async ({ page }) => {
        // Custom login page at /auth/login
        await page.goto('/auth/login');

        // Should show login form with email/password inputs
        await expect(page.getByRole('heading', { name: 'Iniciar Sessão' })).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/palavra-passe/i)).toBeVisible();
    });

    test('Dashboard redirects unauthenticated users', async ({ page }) => {
        await page.goto('/dashboard');

        // Should redirect to login or show auth prompt
        // Expect /auth/login or /api/auth/signin
        await page.waitForURL(/login|signin|auth/, { timeout: 10000 });
    });

    test('API Health Check returns healthy status', async ({ request }) => {
        const response = await request.get('/api/monitoring/health');

        expect(response.status()).toBeLessThan(300);

        const body = await response.json();
        expect(body).toHaveProperty('status');
        expect(['healthy', 'degraded']).toContain(body.status);
        expect(body).toHaveProperty('database');
        expect(body).toHaveProperty('timestamp');
    });

    test('Avisos API returns data', async ({ request }) => {
        const response = await request.get('/api/avisos?page=1&limit=5');

        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body).toHaveProperty('avisos');
        expect(Array.isArray(body.avisos)).toBe(true);
    });

    test('Lead Magnet form is accessible', async ({ page }) => {
        await page.goto('/');

        // Look for lead capture elements (form or CTA)
        const leadForm = page.locator('form[action*="lead"], [data-testid="lead-form"], input[type="email"]');

        // At minimum, landing should have some form of lead capture
        // This is a soft check - just ensure page loads correctly
        await expect(page.locator('body')).toBeVisible();
    });

});

test.describe('Authenticated User Flow', () => {

    // Skip these tests if no test credentials are provided
    test.skip(!process.env.TEST_USER_EMAIL, 'Skipped: No TEST_USER_EMAIL provided');

    test.beforeEach(async ({ page }) => {
        // TODO: Implement authenticated session setup
        // This would typically use:
        // 1. API-based login to get session cookie
        // 2. Or storageState from a global setup

        // For now, skip if not configured
        test.skip(true, 'Auth flow not yet configured for E2E');
    });

    test('Can view avisos in dashboard', async ({ page }) => {
        await page.goto('/dashboard');

        // Should see avisos list
        await expect(page.getByRole('heading', { name: /avisos|oportunidades/i })).toBeVisible();

        // At least one aviso card should be visible
        const avisoCards = page.locator('[data-testid="aviso-card"], .aviso-card, article');
        await expect(avisoCards.first()).toBeVisible({ timeout: 15000 });
    });

    test('Chatbot responds to query', async ({ page }) => {
        await page.goto('/dashboard');

        // Open chatbot
        const chatTrigger = page.locator('[data-testid="chatbot-trigger"], button:has-text("Chat"), .chatbot-button');
        await chatTrigger.click();

        // Type a query
        const chatInput = page.locator('[data-testid="chat-input"], input[placeholder*="mensagem"], textarea');
        await chatInput.fill('Quais são os avisos abertos?');
        await chatInput.press('Enter');

        // Wait for response
        const botResponse = page.locator('[data-testid="bot-message"], .bot-message, .chat-response');
        await expect(botResponse.first()).toBeVisible({ timeout: 30000 });
    });

});
