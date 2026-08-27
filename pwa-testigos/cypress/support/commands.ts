// Custom Cypress Commands

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/home');
  });
});

Cypress.Commands.add('fillActaForm', (data: {
  mesaId: string;
  votantes: string;
  boletas: string;
  candidato1: string;
  candidato2: string;
  candidato3: string;
  blanco: string;
}) => {
  // Fill mesa
  cy.get('input[type="number"]').first().type(data.mesaId);
  
  // Fill votantes
  cy.contains('Votantes').parent().find('input').type(data.votantes);
  
  // Fill boletas
  cy.contains('Boletas').parent().find('input').type(data.boletas);
  
  // Fill votos candidato 1
  cy.contains('Candidato A').parent().find('input').type(data.candidato1);
  
  // Fill votos candidato 2
  cy.contains('Candidato B').parent().find('input').type(data.candidato2);
  
  // Fill votos candidato 3
  cy.contains('Candidato C').parent().find('input').type(data.candidato3);
  
  // Fill votos en blanco
  cy.contains('Votos en Blanco').parent().find('input').type(data.blanco);
});

// Mock service worker commands
Cypress.Commands.add('mockOffline', () => {
  cy.intercept('POST', '/api/**', (req) => {
    req.reply({
      statusCode: 503,
      body: { message: 'Service Unavailable' },
    });
  }).as('apiOffline');
});

Cypress.Commands.add('mockLoginSuccess', () => {
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      user: {
        id: 1,
        email: 'test@test.com',
        nombre: 'Test User',
        permisos: ['testigo'],
      },
      token: 'fake-jwt-token',
      refreshToken: 'fake-refresh-token',
    },
  }).as('loginRequest');
});

Cypress.Commands.add('mockGuardarActa', () => {
  cy.intercept('POST', '/api/preconteo/actas', {
    statusCode: 201,
    body: {
      success: true,
      data: {
        id: 123,
        estado: 'REPORTADA',
      },
    },
  }).as('guardarActa');
});
