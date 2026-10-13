import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { Client } from 'pg';
import coverageTask from '@cypress/code-coverage/task';
// The release version, sent as the `app-version` header the API compares against (#1643)
import packageJson from '../../package.json';

/**
 * The specs that need the gateway (iqb-gate) in front of the studio, with its check on. They count
 * only when the run says so (IQB_GATE_E2E=on, as `make dev-test-e2e-gate` sets it); every other run,
 * against the frontend without a gateway, leaves them out.
 */
function gateSpecs(): string[] {
  const { IQB_GATE_E2E } = process.env;
  return IQB_GATE_E2E?.trim().toLowerCase() === 'on' ? [] : ['src/e2e/iqb-gate/**'];
}

const cypressJsonConfig = {
  fileServerFolder: '.',
  fixturesFolder: './src/fixtures',
  video: true,
  videosFolder: '../../dist/cypress/apps/frontend-e2e/videos',
  screenshotsFolder: '../../dist/cypress/apps/frontend-e2e/screenshots',
  chromeWebSecurity: false,
  specPattern: 'src/e2e/**/*.cy.{js,jsx,ts,tsx}',
  // Cypress's own default, kept beside the one addition
  excludeSpecPattern: ['*.hot-update.js', ...gateSpecs()],
  supportFile: 'src/support/e2e.ts'
};

/** The password of the gateway's audit page (IQB_GATE_AUDIT_KEY), for the gateway's spec. */
function gateAuditKey(): string {
  const { IQB_GATE_AUDIT_KEY } = process.env;
  return IQB_GATE_AUDIT_KEY ?? '';
}

/**
 * A connection to the test database, from the variables the e2e containers and CI jobs set.
 *
 * Destructured instead of accessed: process.env is an index signature, so tsconfig's
 * noPropertyAccessFromIndexSignature forbids the dot while eslint's dot-notation forbids the
 * bracket -- destructuring is the one spelling both accept (#1590).
 */
function databaseClient(): Client {
  const {
    DB_HOST, POSTGRES_HOST, DB_PORT, POSTGRES_PORT, DB_USER,
    POSTGRES_USER, DB_PASSWORD, POSTGRES_PASSWORD, DB_NAME, POSTGRES_DB
  } = process.env;
  return new Client({
    host: DB_HOST || POSTGRES_HOST || 'db',
    port: Number(DB_PORT || POSTGRES_PORT || 5432),
    user: DB_USER || POSTGRES_USER || 'root',
    password: DB_PASSWORD || POSTGRES_PASSWORD || 'root-password',
    database: DB_NAME || POSTGRES_DB || 'studio-lite'
  });
}

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
    version: packageJson.version,
    // The password of the gateway's audit page, for the gateway's spec
    gateAuditKey: gateAuditKey()
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
          const client = databaseClient();
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
        },
        // Only for the gateway's spec: there, creating a group and a workspace is a save of the
        // administration, which Cypress itself is not allowed to make
        async createWorkspaceFor({ userName, workspaceName }: { userName: string; workspaceName: string }) {
          const client = databaseClient();
          await client.connect();
          try {
            const group = await client.query(
              'INSERT INTO "public"."workspace_group" ("name") VALUES ($1) RETURNING "id";',
              [`${workspaceName} group`]
            );
            const workspace = await client.query(
              'INSERT INTO "public"."workspace" ("name", "group_id") VALUES ($1, $2) RETURNING "id";',
              [workspaceName, group.rows[0].id]
            );
            await client.query(
              'INSERT INTO "public"."workspace_user" ("workspace_id", "user_id", "access_level") ' +
              'SELECT $1, "id", 4 FROM "public"."user" WHERE "name" = $2;',
              [workspace.rows[0].id, userName]
            );
            return workspace.rows[0].id as number;
          } finally {
            await client.end();
          }
        }
      });

      return config;
    }
  }
});
