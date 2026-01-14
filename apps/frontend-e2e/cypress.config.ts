import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { Client } from 'pg';

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
    username: 'fadmin',
    password: '4445',
    locale: 'de',
    version: '13.9.0'
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
    testIsolation: false,
    // Please ensure you use `cy.origin()` when navigating between domains and remove this option.
    // See https://docs.cypress.io/app/references/migration-guide#Changes-to-cyorigin
    injectDocumentDomain: true,
    setupNodeEvents(on, config) {
      on('task', {
        async resetDatabase() {
          const client = new Client({
            host: process.env.DB_HOST ?? 'db',
            port: Number(process.env.DB_PORT) ?? 5432,
            user: process.env.DB_USER ?? 'root',
            password: process.env.DB_PASSWORD ?? 'root-password',
            database: process.env.DB_NAME ?? 'studio-lite'
          });

          await client.connect();

          try {
            await client.query(
              'TRUNCATE TABLE  "public"."resource_package" RESTART IDENTITY;'
            );
            await client.query(
              'TRUNCATE TABLE  "public"."user" RESTART IDENTITY CASCADE;'
            );
            await client.query(
              'TRUNCATE TABLE  "public"."workspace_group" RESTART IDENTITY CASCADE;'
            );
          } finally {
            await client.end();
          }

          return null;
        }
      });

      return config;
    }
  }
});
