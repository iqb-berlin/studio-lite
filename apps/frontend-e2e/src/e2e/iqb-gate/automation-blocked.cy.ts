import type { AuthDataDto } from '@studio-lite-lib/api-dto';

/**
 * The gateway in front of the studio (iqb-gate) lets only people log in, save and read the API --
 * everywhere, by default: browsers driven by tools like Cypress, scripts calling the API, and clients
 * that only pretend to be a person are kept out. This spec checks that from the side of the
 * automation: Cypress is exactly what is to be kept out. So it cannot log in through the gateway
 * itself, and sets up its account past it.
 *
 * Runs only through the gateway with its check on and no rule switched off
 * (`make dev-test-e2e-gate`); every other run leaves this folder out (cypress.config.ts).
 */
describe('Logins, saves and reads only from people (iqb-gate)', () => {
  const username = Cypress.expose('username');
  const password = Cypress.expose('password');
  // The studio straight from app-net, past the dev Traefik that asks the gateway (traefik-dev.yaml)
  const pastTheGateway = 'http://frontend:8080';
  const signalsHeader = 'x-client-signals';
  // What a person's browser reports: nothing automated, a click a moment ago
  const person = {
    webdriver: false,
    headless: false,
    untrustedInput: false,
    msSinceTrustedInput: 200,
    softwareRenderer: false,
    devtoolsProtocol: false
  };
  const personSignals = JSON.stringify(person);
  // A headless browser driven by a script. Not reporting webdriver keeps it a kind of rejection of
  // its own: the browser Cypress drives reports webdriver, in the same session and on the same path
  const headlessSignals = JSON.stringify({ ...person, headless: true });
  const groupName = 'Gruppe von Cypress';
  let token = '';
  let refreshToken = '';
  let userId = 0;
  let workspaceId = 0;
  let startedAt = '';

  /** What the gateway answers a rejected request with. */
  type Rejection = { code: string; signals: string[] };

  type AuditEntry = {
    outcome: string;
    method: string;
    path: string;
    rule: string;
    user: string | null;
    statusCode: number;
    repeated: number;
    blockingSignals: string[];
  };

  const headersWith = (headers: Record<string, string>): Record<string, string> => ({
    'app-version': Cypress.expose('version'),
    authorization: `bearer ${token}`,
    ...headers
  });

  /** Sends a read as a script would: no browser, no report on it -- logged in, with the token. */
  const readAsScript = (
    url: string,
    headers: Record<string, string> = {}
  ): Cypress.Chainable<Cypress.Response<Rejection>> => cy.request<Rejection>({
    url,
    headers: headersWith(headers),
    failOnStatusCode: false
  });

  /** Sends a write as a script would: no browser, no report on it. */
  const writeAsScript = (
    method: string,
    url: string,
    body: object = {},
    headers: Record<string, string> = {}
  ): Cypress.Chainable<Cypress.Response<Rejection>> => cy.request<Rejection>({
    method,
    url,
    body,
    headers: headersWith(headers),
    failOnStatusCode: false
  });

  /** Creates a workspace group as a script would: a save of the administration. */
  const createGroup = (headers: Record<string, string> = {}) => writeAsScript(
    'POST',
    '/api/admin/workspace-groups',
    { name: groupName },
    headers
  );

  const expectAutomationDetected = (response: Cypress.Response<Rejection>): void => {
    expect(response.status).to.equal(403);
    expect(response.body.code).to.equal('automation-detected');
  };

  /** Opens the studio through the gateway, logged in with the account made past it. */
  const visitLoggedIn = (): void => {
    cy.visit('/', {
      onBeforeLoad: win => {
        win.localStorage.setItem('id_token', token);
        win.localStorage.setItem('refresh_token', refreshToken);
      }
    });
  };

  /**
   * The gateway's audit entries since the spec began, once they satisfy `ready`. An entry is written
   * after its response has been sent, so the newest one may need a moment.
   */
  const auditSinceStart = (
    ready: (entries: AuditEntry[]) => boolean,
    attempts = 10
  ): Cypress.Chainable<AuditEntry[]> => cy
    .request<AuditEntry[]>({
      url: `/.iqb-gate/admin/audit?from=${encodeURIComponent(startedAt)}`,
      headers: { authorization: `Bearer ${Cypress.expose('gateAuditKey')}` }
    })
    .then(response => {
      const entries = response.body;
      if (ready(entries) || attempts <= 1) return cy.wrap(entries);
      return cy.wait(300).then(() => auditSinceStart(ready, attempts - 1));
    });

  before(() => {
    startedAt = new Date().toISOString();
    cy.resetDb();
    cy.request<{ accessToken: string; refreshToken: string }>({
      method: 'POST',
      url: `${pastTheGateway}/api/init-login`,
      headers: { 'app-version': Cypress.expose('version') },
      body: { username, password }
    }).then(({ body }) => {
      token = body.accessToken;
      refreshToken = body.refreshToken;
      // A read: past the gateway as well, which lets no read of Cypress through
      cy.request<AuthDataDto>({ url: `${pastTheGateway}/api/auth-data`, headers: headersWith({}) }).then(response => {
        userId = response.body.userId;
      });
    });
    // Created in the database: through the API it would be a save, which Cypress may not make
    cy.task('createWorkspaceFor', { userName: username, workspaceName: 'Arbeitsbereich von Cypress' })
      .then(id => {
        workspaceId = id as number;
      });
  });

  it('rejects a login sent without a browser, as a script sends it', () => {
    cy.request<Rejection>({
      method: 'POST',
      url: '/api/login',
      headers: { 'app-version': Cypress.expose('version') },
      body: { username, password },
      failOnStatusCode: false
    }).then(response => {
      expectAutomationDetected(response);
      expect(response.body.signals).to.include('signals-missing');
    });
  });

  it('rejects a login through the browser that Cypress drives, and says why', () => {
    cy.intercept('POST', '/api/login').as('login');
    cy.visit('/');
    cy.login(username, password);
    cy.get('[data-cy="home-submit-button"]').click();
    cy.wait('@login').its('response.statusCode').should('equal', 403);
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('[data-cy="gate-refusal-message"]')
        .should('be.visible')
        .and('have.text', json['human-verification']['automation-detected']);
    });
  });

  it('rejects an administration save sent without a browser, as a script sends it', () => {
    createGroup().then(response => {
      expectAutomationDetected(response);
      expect(response.body.signals).to.include('signals-missing');
    });
  });

  it('asks a client that only pretends to be a person for the challenge first', () => {
    createGroup({ [signalsHeader]: personSignals }).its('status').should('equal', 428);
  });

  it('rejects a read sent without a browser, as a script sends it, also with a valid token', () => {
    readAsScript(`/api/workspaces/${workspaceId}`).then(response => {
      expectAutomationDetected(response);
      expect(response.body.signals).to.include('signals-missing');
    });
  });

  it('asks a client that only pretends to be a person for the challenge before it reads', () => {
    readAsScript(`/api/workspaces/${workspaceId}`, { [signalsHeader]: personSignals })
      .its('status').should('equal', 428);
  });

  // Logged in, the browser Cypress drives cannot even load the page: its first read is refused
  it('rejects the reads of the browser that Cypress drives, and says why', () => {
    cy.intercept('GET', '/api/auth-data').as('authData');
    visitLoggedIn();
    cy.wait('@authData').then(({ response }) => {
      expect(response?.statusCode).to.equal(403);
      expect(response?.body.code).to.equal('automation-detected');
      // Cypress launches Chrome as automated, and the browser says so
      expect(response?.body.signals).to.include('webdriver');
    });
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('[data-cy="gate-refusal-message"]')
        .should('be.visible')
        .and('have.text', json['human-verification']['automation-detected']);
    });
  });

  // What a page reads before the login, and the resource packages that Verona modules load with
  // script tags: neither can carry the browser's report
  it('lets the reads through that no person could have reported', () => {
    readAsScript('/api/admin/settings/config').its('status').should('equal', 200);
    readAsScript('/api/admin/settings/app-logo').its('status').should('be.within', 200, 299);
    readAsScript('/api/packages/no-such-package/file.js').its('status').should('equal', 404);
  });

  // `other` takes what no area names -- an endpoint added later is checked from its first day
  it('rejects every other save as well, also where no area names it', () => {
    writeAsScript('PATCH', `/api/workspaces/${workspaceId}/name`, { name: 'umbenannt' })
      .then(expectAutomationDetected);
    writeAsScript('PATCH', '/api/my-data', { id: userId }).then(expectAutomationDetected);
    writeAsScript('POST', '/api/reviews/1/units/1/comments', { body: 'Kommentar' })
      .then(expectAutomationDetected);
    writeAsScript('POST', '/api/an-endpoint-added-later').then(expectAutomationDetected);
  });

  it('lets through what runs without a person acting on it', () => {
    writeAsScript('POST', '/api/activity').its('status').should('be.within', 200, 299);
  });

  // A script in a loop is rejected at once; one entry per request would bury every other one
  it('folds the same rejection, repeated within a minute, into one entry with its count', () => {
    // Who the entry names (userClaim) is part of what folds. A name of this run's own keeps a run
    // started within a minute of the last one from folding into the entry of that one, which is
    // older than startedAt. The token is never checked: the gateway rejects before the studio sees it.
    const writer = `cypress-${Date.now()}`;
    const base64Url = (value: object): string => btoa(JSON.stringify(value))
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const unsignedToken = `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url({ username: writer })}.`;
    Cypress._.times(5, () => {
      createGroup({ [signalsHeader]: headlessSignals, authorization: `bearer ${unsignedToken}` })
        .its('status').should('equal', 403);
    });
    const folded = (entries: AuditEntry[]) => entries
      .filter(entry => entry.user === writer)
      .filter(entry => entry.blockingSignals.length === 1 && entry.blockingSignals[0] === 'headless');
    auditSinceStart(entries => folded(entries)[0]?.repeated === 4).then(entries => {
      expect(folded(entries)).to.have.length(1);
      expect(folded(entries)[0].repeated).to.equal(4);
    });
  });

  it('records every checked attempt under its rule, and nothing it let through', () => {
    const rules = ['login', 'administration', 'workspace', 'account', 'review', 'other'];
    const writes = (entries: AuditEntry[]) => entries.filter(entry => entry.method !== 'GET');
    // An entry is written after its answer: once every rule has one, the spec waits a moment
    // longer, so that a wrongly recorded heartbeat would have arrived too
    auditSinceStart(entries => rules.every(rule => entries.some(entry => entry.rule === rule)));
    cy.wait(1000);
    auditSinceStart(() => true).then(entries => {
      expect([...new Set(entries.map(entry => entry.rule))]).to.have.members(rules);
      expect(entries.map(entry => entry.outcome)).to.include.members(['automation-detected', 'verification-required']);
      expect(writes(entries).filter(entry => entry.rule === 'login').every(entry => entry.path === '/api/login'))
        .to.equal(true);
      expect(writes(entries).filter(entry => entry.rule === 'administration')
        .every(entry => entry.path === '/api/admin/workspace-groups')).to.equal(true);
      // Refused reads are recorded under their rules as well; public ones are not checked at all
      expect(entries.some(entry => entry.method === 'GET' && entry.rule === 'workspace')).to.equal(true);
      expect(entries.some(entry => entry.method === 'GET' && entry.rule === 'account')).to.equal(true);
      expect(entries.some(entry => entry.path.startsWith('/api/admin/settings/'))).to.equal(false);
      expect(entries.some(entry => entry.path === '/api/activity')).to.equal(false);
      expect(entries.some(entry => entry.user === username)).to.equal(true);
    });
    cy.visit('/.iqb-gate/admin/', { auth: { username: 'cypress', password: Cypress.expose('gateAuditKey') } });
    cy.contains('td', '/api/admin/workspace-groups').should('be.visible');
  });
});
