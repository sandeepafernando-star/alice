/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (
  email = Cypress.env('TEST_USER_EMAIL'),
  password = Cypress.env('TEST_USER_PASSWORD')
) => {
  if (!email || !password) {
    throw new Error('Cypress login error: TEST_USER_EMAIL or TEST_USER_PASSWORD environment variable is missing.');
  }
  cy.visit('/login');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});
