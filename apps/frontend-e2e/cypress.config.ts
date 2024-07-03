import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

const cypressJsonConfig = {
  fileServerFolder: '.',
  fixturesFolder: './src/fixtures',
  video: true,
  videosFolder: '../../dist/cypress/apps/frontend-e2e/videos',
  screenshotsFolder: '../../dist/cypress/apps/frontend-e2e/screenshots',
  chromeWebSecurity: false,
  specPattern: 'src/e2e/**/*.cy.{js,jsx,ts,tsx}',
  supportFile: 'src/support/e2e.ts'
};
export default defineConfig({
  env: {
    username: 'admin',
    password: '1234',
    version: '7.6.0',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJzdWIyIjowLCJpYXQiOjE3MTk4MjA1MTAsImV4cCI6MTcxOTkwNjkxMH0.5YI_jZy-VM4gNtMART9Kj5Rx42HbHzVj4LA3buy9Sag'
  },
  e2e: {
    ...nxE2EPreset(__dirname),
    ...cypressJsonConfig,
    viewportWidth: 1600,
    viewportHeight: 900,
    watchForFileChanges: false,
    defaultCommandTimeout: 10000,
    /**
     * TODO(@nx/cypress): In Cypress v12,the testIsolation option is turned on by default.
     * This can cause tests to start breaking where not indended.
     * You should consider enabling this once you verify tests do not depend on each other
     * More Info: https://docs.cypress.io/guides/references/migration-guide#Test-Isolation
     * */
    testIsolation: false
  }

});
