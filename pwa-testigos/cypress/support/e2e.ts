// Cypress E2E Support File

import './commands';

// Hide fetch/XHR requests from command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// IndexedDB cleanup before each test
beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Clear IndexedDB
  cy.window().then((win) => {
    return new Promise<void>((resolve) => {
      const request = win.indexedDB.deleteDatabase('PreconteoDB');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });
});

// Custom command to check offline mode
Cypress.Commands.add('goOffline', () => {
  cy.log('**Going offline**')
    .then(() => {
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.emulateNetworkConditions',
        params: {
          offline: true,
          latency: 0,
          downloadThroughput: 0,
          uploadThroughput: 0,
        },
      });
    });
});

Cypress.Commands.add('goOnline', () => {
  cy.log('**Going online**')
    .then(() => {
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.emulateNetworkConditions',
        params: {
          offline: false,
          latency: 0,
          downloadThroughput: -1,
          uploadThroughput: -1,
        },
      });
    });
});

declare global {
  namespace Cypress {
    interface Chainable {
      goOffline(): Chainable<void>;
      goOnline(): Chainable<void>;
      login(email: string, password: string): Chainable<void>;
      fillActaForm(data: ActaFormData): Chainable<void>;
    }
  }
}

interface ActaFormData {
  mesaId: string;
  votantes: string;
  boletas: string;
  candidato1: string;
  candidato2: string;
  candidato3: string;
  blanco: string;
}
