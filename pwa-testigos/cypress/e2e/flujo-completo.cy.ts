describe('PWA Testigos - Flujo Completo', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Autenticación', () => {
    it('debe mostrar página de login al iniciar', () => {
      cy.url().should('include', '/login');
      cy.contains('Sistema de Preconteo').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('debe validar campos requeridos en login', () => {
      cy.get('button[type="submit"]').click();
      // HTML5 validation should prevent submission
      cy.get('input[type="email"]:invalid').should('exist');
    });

    it('debe mostrar mensaje de error con credenciales incorrectas', () => {
      cy.get('input[type="email"]').type('wrong@test.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Should show error or attempt offline login
      cy.contains('Error de autenticación', { timeout: 5000 }).should('be.visible');
    });

    it('debe navegar a home después de login exitoso', () => {
      cy.mockLoginSuccess();
      
      cy.get('input[type="email"]').type('test@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@loginRequest');
      cy.url().should('include', '/home');
      cy.contains('¡Hola').should('be.visible');
    });

    it('debe permitir login offline si hay datos guardados', () => {
      // Primero login online para guardar datos
      cy.mockLoginSuccess();
      cy.get('input[type="email"]').type('test@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');
      
      // Logout
      cy.get('ion-button[color="light"]').click();
      cy.contains('Cerrar Sesión').click();
      cy.contains('Salir').click();
      
      // Ahora ir offline y loguear de nuevo
      cy.goOffline();
      cy.reload();
      
      cy.contains('Modo Offline').should('be.visible');
      cy.get('input[type="email"]').type('test@test.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.url().should('include', '/home');
      
      cy.goOnline();
    });
  });

  describe('Navegación Principal', () => {
    beforeEach(() => {
      cy.mockLoginSuccess();
      cy.login('test@test.com', 'password123');
    });

    it('debe mostrar dashboard con estadísticas', () => {
      cy.contains('Testigos Electorales').should('be.visible');
      cy.contains('Registrar Acta').should('be.visible');
      cy.contains('Pendientes').should('be.visible');
      cy.contains('Mi Perfil').should('be.visible');
    });

    it('debe navegar a formulario de acta', () => {
      cy.contains('Registrar Acta').click();
      cy.url().should('include', '/acta/nueva');
      cy.contains('Información General').should('be.visible');
    });

    it('debe navegar a actas pendientes', () => {
      cy.contains('Pendientes').click();
      cy.url().should('include', '/pendientes');
      cy.contains('Actas Pendientes').should('be.visible');
    });

    it('debe navegar a perfil', () => {
      cy.contains('Mi Perfil').click();
      cy.url().should('include', '/perfil');
      cy.contains('Mi Perfil').should('be.visible');
    });
  });

  describe('Formulario de Acta', () => {
    beforeEach(() => {
      cy.mockLoginSuccess();
      cy.login('test@test.com', 'password123');
      cy.contains('Registrar Acta').click();
    });

    it('debe mostrar todas las secciones del formulario', () => {
      cy.contains('Información General').should('be.visible');
      cy.contains('Votación').should('be.visible');
      cy.contains('Resultados por Candidato').should('be.visible');
      cy.contains('Evidencias Fotográficas').should('be.visible');
      cy.contains('Observaciones').should('be.visible');
    });

    it('debe validar campos requeridos', () => {
      cy.contains('Guardar Acta').click();
      
      // Debe mostrar errores de validación
      cy.contains('El número de mesa es requerido').should('be.visible');
      cy.contains('Ingrese el número de votantes').should('be.visible');
      cy.contains('Ingrese las boletas entregadas').should('be.visible');
      cy.contains('Adjunte al menos una foto del acta').should('be.visible');
    });

    it('debe permitir llenar el formulario completo', () => {
      cy.fillActaForm({
        mesaId: '42',
        votantes: '300',
        boletas: '300',
        candidato1: '150',
        candidato2: '80',
        candidato3: '50',
        blanco: '20',
      });

      // Verificar cálculo de total
      cy.contains('Total Votos:').parent().should('contain', '300');
    });

    it('debe mostrar alerta si votos > votantes', () => {
      cy.fillActaForm({
        mesaId: '42',
        votantes: '100',
        boletas: '100',
        candidato1: '200',
        candidato2: '0',
        candidato3: '0',
        blanco: '0',
      });

      cy.contains('Guardar Acta').click();
      cy.contains('Alerta: Los votos').should('be.visible');
    });

    it('debe guardar acta en modo offline', () => {
      cy.goOffline();
      
      cy.fillActaForm({
        mesaId: '42',
        votantes: '300',
        boletas: '300',
        candidato1: '150',
        candidato2: '80',
        candidato3: '50',
        blanco: '20',
      });

      // Simular evidencias (skip camera)
      cy.window().then((win) => {
        win.localStorage.setItem('skipCamera', 'true');
      });

      // Nota: En test real necesitaríamos mock de cámara
      cy.contains('Guardar Acta').click();
      
      // Debe mostrar mensaje de guardado
      cy.contains('Acta guardada exitosamente', { timeout: 5000 }).should('be.visible');
      
      cy.goOnline();
    });
  });

  describe('Sincronización', () => {
    beforeEach(() => {
      cy.mockLoginSuccess();
      cy.login('test@test.com', 'password123');
    });

    it('debe mostrar actas pendientes de sincronizar', () => {
      // Crear acta pendiente primero
      cy.goOffline();
      cy.contains('Registrar Acta').click();
      cy.fillActaForm({
        mesaId: '99',
        votantes: '200',
        boletas: '200',
        candidato1: '100',
        candidato2: '50',
        candidato3: '30',
        blanco: '20',
      });
      
      // Guardar sin cámara para tests
      cy.window().then((win) => {
        win.localStorage.setItem('skipCamera', 'true');
      });
      
      cy.contains('Guardar Acta').click();
      cy.wait(1000);
      cy.goOnline();
      
      // Ir a pendientes
      cy.contains('Pendientes').click();
      cy.url().should('include', '/pendientes');
      cy.contains('Mesa #99').should('be.visible');
    });

    it('debe sincronizar actas cuando hay conexión', () => {
      cy.mockGuardarActa();
      
      cy.contains('Pendientes').click();
      cy.contains('Sincronizar Todo').click();
      
      cy.wait('@guardarActa', { timeout: 10000 });
      cy.contains('Acta sincronizada exitosamente').should('be.visible');
    });
  });

  describe('Perfil y Configuración', () => {
    beforeEach(() => {
      cy.mockLoginSuccess();
      cy.login('test@test.com', 'password123');
      cy.contains('Mi Perfil').click();
    });

    it('debe mostrar información del usuario', () => {
      cy.contains('Test User').should('be.visible');
      cy.contains('test@test.com').should('be.visible');
    });

    it('debe mostrar estadísticas', () => {
      cy.contains('Estadísticas').should('be.visible');
      cy.contains('Pendientes').should('be.visible');
      cy.contains('Enviadas').should('be.visible');
      cy.contains('Evidencias').should('be.visible');
    });

    it('debe permitir cerrar sesión', () => {
      cy.contains('Cerrar Sesión').click();
      cy.contains('Eliminar Todo').should('be.visible');
      cy.contains('Salir').click();
      
      cy.url().should('include', '/login');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.mockLoginSuccess();
      cy.login('test@test.com', 'password123');
    });

    it('debe verse correctamente en móvil (375x667)', () => {
      cy.viewport(375, 667);
      cy.contains('Testigos Electorales').should('be.visible');
      cy.contains('Registrar Acta').should('be.visible');
    });

    it('debe verse correctamente en tablet (768x1024)', () => {
      cy.viewport(768, 1024);
      cy.contains('Testigos Electorales').should('be.visible');
    });

    it('debe verse correctamente en desktop (1280x720)', () => {
      cy.viewport(1280, 720);
      cy.contains('Testigos Electorales').should('be.visible');
    });
  });
});
