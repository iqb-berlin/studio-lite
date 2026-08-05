import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { Client } from 'pg';
import coverageTask from '@cypress/code-coverage/task';

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
  allowCypressEnv: false,
  env: {
    codeCoverage: {
      quiet: true
    }
  },
  expose: {
    username: 'fadmin',
    password: '4445',
    locale: 'de',
    version: '18.0.0'
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
    // Frees renderer memory between tests; long UI specs with player/editor
    // iframes otherwise crash the Chrome renderer (out of memory).
    experimentalMemoryManagement: true,
    setupNodeEvents(on, config) {
      config.env = config.env || {};
      coverageTask(on, config);
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // /dev/shm is only 64MB in CI job containers; without this flag
          // Chrome places shared memory there and the renderer crashes.
          launchOptions.args.push('--disable-dev-shm-usage');
        }
        return launchOptions;
      });
      on('task', {
        async resetDatabase() {
          // Destructured instead of accessed: process.env is an index signature,
          // so tsconfig's noPropertyAccessFromIndexSignature forbids the dot while
          // eslint's dot-notation forbids the bracket -- destructuring is the one
          // spelling both accept (#1590).
          const {
            DB_HOST, POSTGRES_HOST, DB_PORT, POSTGRES_PORT, DB_USER,
            POSTGRES_USER, DB_PASSWORD, POSTGRES_PASSWORD, DB_NAME, POSTGRES_DB
          } = process.env;
          const client = new Client({
            host: DB_HOST || POSTGRES_HOST || 'db',
            port: Number(DB_PORT || POSTGRES_PORT || 5432),
            user: DB_USER || POSTGRES_USER || 'root',
            password: DB_PASSWORD || POSTGRES_PASSWORD || 'root-password',
            database: DB_NAME || POSTGRES_DB || 'studio-lite'
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
