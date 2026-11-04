// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import './commands-api';
import './metadata/commands-metadata';
import '@cypress/code-coverage/support';

// Runs once before each spec file, as a hook at the top of the support file does. Every spec starts
// with a database without users, groups and resource packages, whatever the spec before left behind
// or failed to remove (#2028). The storage goes too: the reset restarts the ids, and a token left
// there would pass for the next first user, who gets id 1 again. No reload is needed, as each spec
// file starts on a new page, without the app of the spec before. Modules, settings and metadata
// profiles stay.
before(() => {
  cy.resetDb();
  cy.clearAllLocalStorage();
});
