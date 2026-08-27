/**
 * E2E Tests - App Móvil Testigos
 * Usando Detox para testing end-to-end
 * 
 * Setup:
 * npm install -D detox
 * npx detox init
 */

// Detox E2E Test Configuration
describe('App Móvil Testigos - E2E Tests', () => {
  
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Login Flow', () => {
    it('should show login screen on first launch', async () => {
      await expect(element(by.id('login-screen'))).toBeVisible();
      await expect(element(by.id('login-email-input'))).toBeVisible();
      await expect(element(by.id('login-password-input'))).toBeVisible();
      await expect(element(by.id('login-button'))).toBeVisible();
    });

    it('should login with valid credentials', async () => {
      await element(by.id('login-email-input')).typeText('demo@testigo.com');
      await element(by.id('login-password-input')).typeText('Demo123!');
      await element(by.id('login-button')).tap();
      
      // Wait for navigation to home
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show error with invalid credentials', async () => {
      await element(by.id('login-email-input')).typeText('invalid@email.com');
      await element(by.id('login-password-input')).typeText('wrongpassword');
      await element(by.id('login-button')).tap();
      
      await expect(element(by.text('Credenciales inválidas'))).toBeVisible();
    });
  });

  describe('Home Screen', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('login-email-input')).typeText('demo@testigo.com');
      await element(by.id('login-password-input')).typeText('Demo123!');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should display dashboard with stats', async () => {
      await expect(element(by.id('home-screen'))).toBeVisible();
      await expect(element(by.id('stats-pendientes'))).toBeVisible();
      await expect(element(by.id('stats-enviadas'))).toBeVisible();
      await expect(element(by.id('stats-total'))).toBeVisible();
    });

    it('should navigate to new acta form', async () => {
      await element(by.id('btn-nueva-acta')).tap();
      await expect(element(by.id('formulario-acta-screen'))).toBeVisible();
    });

    it('should navigate to pendientes list', async () => {
      await element(by.id('btn-ver-pendientes')).tap();
      await expect(element(by.id('pendientes-screen'))).toBeVisible();
    });
  });

  describe('Formulario Acta', () => {
    beforeEach(async () => {
      // Login and navigate to form
      await element(by.id('login-email-input')).typeText('demo@testigo.com');
      await element(by.id('login-password-input')).typeText('Demo123!');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
      await element(by.id('btn-nueva-acta')).tap();
      await expect(element(by.id('formulario-acta-screen'))).toBeVisible();
    });

    it('should show form fields', async () => {
      await expect(element(by.id('input-eleccion'))).toBeVisible();
      await expect(element(by.id('input-cargo'))).toBeVisible();
      await expect(element(by.id('input-mesa'))).toBeVisible();
      await expect(element(by.id('input-total-votantes'))).toBeVisible();
      await expect(element(by.id('input-boletas'))).toBeVisible();
    });

    it('should validate required fields', async () => {
      await element(by.id('btn-guardar')).tap();
      await expect(element(by.text('Mesa es requerida'))).toBeVisible();
    });

    it('should save acta with valid data', async () => {
      // Select eleccion
      await element(by.id('input-eleccion')).tap();
      await element(by.text('Presidenciales 2026')).tap();
      
      // Select cargo
      await element(by.id('input-cargo')).tap();
      await element(by.text('Presidente')).tap();
      
      // Fill form
      await element(by.id('input-mesa')).typeText('12345');
      await element(by.id('input-total-votantes')).typeText('300');
      await element(by.id('input-boletas')).typeText('300');
      
      // Add votes
      await element(by.id('voto-candidato-1')).typeText('150');
      await element(by.id('voto-candidato-2')).typeText('100');
      await element(by.id('voto-blanco')).typeText('50');
      
      // Save
      await element(by.id('btn-guardar')).tap();
      
      // Verify success
      await expect(element(by.text('Acta guardada'))).toBeVisible();
      
      // Verify navigation to pendientes
      await waitFor(element(by.id('pendientes-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should validate votes exceed voters', async () => {
      await element(by.id('input-mesa')).typeText('12345');
      await element(by.id('input-total-votantes')).typeText('100');
      await element(by.id('voto-candidato-1')).typeText('150');
      await element(by.id('btn-guardar')).tap();
      
      await expect(element(by.text('Los votos no pueden exceder el número de votantes')))
        .toBeVisible();
    });
  });

  describe('Camera Integration', () => {
    beforeEach(async () => {
      await element(by.id('login-email-input')).typeText('demo@testigo.com');
      await element(by.id('login-password-input')).typeText('Demo123!');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
      await element(by.id('btn-nueva-acta')).tap();
    });

    it('should open camera on photo button tap', async () => {
      await element(by.id('btn-agregar-foto')).tap();
      await expect(element(by.id('camera-view'))).toBeVisible();
    });

    it('should capture photo and show preview', async () => {
      await element(by.id('btn-agregar-foto')).tap();
      await element(by.id('camera-capture')).tap();
      await expect(element(by.id('photo-preview'))).toBeVisible();
    });
  });

  describe('Offline Mode', () => {
    it('should work in airplane mode', async () => {
      // Enable airplane mode
      await device.setURLBlacklist(['.*']);
      
      // Login should work (offline auth)
      await element(by.id('login-email-input')).typeText('demo@testigo.com');
      await element(by.id('login-password-input')).typeText('Demo123!');
      await element(by.id('login-button')).tap();
      
      await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
      
      // Create acta offline
      await element(by.id('btn-nueva-acta')).tap();
      await element(by.id('input-mesa')).typeText('OFFLINE-001');
      await element(by.id('input-total-votantes')).typeText('100');
      await element(by.id('voto-candidato-1')).typeText('100');
      await element(by.id('btn-guardar')).tap();
      
      // Verify saved locally
      await expect(element(by.text('Acta guardada localmente'))).toBeVisible();
      
      // Restore network
      await device.setURLBlacklist([]);
    });
  });

  describe('Sync Functionality', () => {
    beforeEach(async () => {
      await element(by.id('login-email-input')).typeText('demo@testigo.com');
      await element(by.id('login-password-input')).typeText('Demo123!');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should show pending acts count', async () => {
      await element(by.id('btn-ver-pendientes')).tap();
      await expect(element(by.id('pendientes-list'))).toBeVisible();
      await expect(element(by.id('pendientes-count'))).toBeVisible();
    });

    it('should sync individual acta', async () => {
      // Create a pending acta first
      await element(by.id('btn-nueva-acta')).tap();
      await element(by.id('input-mesa')).typeText('SYNC-TEST-001');
      await element(by.id('input-total-votantes')).typeText('100');
      await element(by.id('voto-candidato-1')).typeText('100');
      await element(by.id('btn-guardar')).tap();
      
      // Go to pendientes
      await element(by.id('btn-ver-pendientes')).tap();
      
      // Sync first item
      await element(by.id('btn-sync-0')).tap();
      
      // Verify sync indicator
      await expect(element(by.id('sync-spinner'))).toBeVisible();
      
      // Wait for completion
      await waitFor(element(by.id('sync-success')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => {
      await element(by.id('login-email-input')).typeText('demo@testigo.com');
      await element(by.id('login-password-input')).typeText('Demo123!');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should navigate using bottom tabs', async () => {
      await element(by.id('tab-pendientes')).tap();
      await expect(element(by.id('pendientes-screen'))).toBeVisible();
      
      await element(by.id('tab-mapa')).tap();
      await expect(element(by.id('mapa-screen'))).toBeVisible();
      
      await element(by.id('tab-perfil')).tap();
      await expect(element(by.id('perfil-screen'))).toBeVisible();
      
      await element(by.id('tab-home')).tap();
      await expect(element(by.id('home-screen'))).toBeVisible();
    });

    it('should handle back button correctly', async () => {
      await element(by.id('btn-nueva-acta')).tap();
      await expect(element(by.id('formulario-acta-screen'))).toBeVisible();
      
      await device.pressBack();
      await expect(element(by.id('home-screen'))).toBeVisible();
    });
  });
});

// Test Configuration
describe('Performance Tests', () => {
  it('should launch in less than 2 seconds', async () => {
    const start = Date.now();
    await device.launchApp({ newInstance: true });
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(2000);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  it('should scroll smoothly through long lists', async () => {
    await element(by.id('login-email-input')).typeText('demo@testigo.com');
    await element(by.id('login-password-input')).typeText('Demo123!');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
    
    await element(by.id('btn-ver-pendientes')).tap();
    
    // Scroll test
    const start = Date.now();
    await element(by.id('pendientes-list')).scroll(500, 'down');
    await element(by.id('pendientes-list')).scroll(500, 'up');
    const duration = Date.now() - start;
    
    // Should be smooth (less than 100ms per scroll)
    expect(duration).toBeLessThan(200);
  });
});
