import { noId, sessionIdOf } from '../../support/util-api';

// The studio reports that a browser is still in use, and the session it belongs to is kept from
// expiring. Only that session: one request must not touch the other browsers of the same user.
// ActivityInterceptor stamps most requests as well, but without waiting; this route answers once
// the stamp is written, so it can be read right after.
describe('POST /api/activity', () => {
  type SessionRow = { sessionId: string, lastActivity: string };
  type UserRow = { id: number, sessions?: SessionRow[] };

  const sessions = { active: { token: '', id: '' }, idle: { token: '', id: '' } };
  let adminToken = '';
  let adminId = 0;

  const lastActivities = () => cy.getUsersFullAPI(true, adminToken).then(resp => {
    expect(resp.status).to.equal(200);
    const rows = (resp.body as UserRow[]).find(user => user.id === adminId)?.sessions || [];
    const of = (sessionId: string) => rows.find(row => row.sessionId === sessionId)?.lastActivity;
    return { active: of(sessions.active.id), idle: of(sessions.idle.id) };
  });

  before(() => {
    cy.addFirstUserAPI(Cypress.expose('username'), Cypress.expose('password')).then(resp => {
      expect(resp.status).to.equal(201);
      adminToken = resp.body.accessToken;
      cy.getUserIdAPI(adminToken).then(authData => {
        expect(authData.status).to.equal(200);
        adminId = Number(authData.body.userId);
      });
    });
    (['active', 'idle'] as const).forEach(name => {
      cy.loginAPI(Cypress.expose('username'), Cypress.expose('password')).then(resp => {
        expect(resp.status, `login of the ${name} session`).to.equal(201);
        sessions[name] = { token: resp.body.accessToken, id: sessionIdOf(resp.body.accessToken) };
      });
    });
  });

  it('201 positive test: should move on the last activity of the session in the token, and of no other', () => {
    lastActivities().then(before => {
      expect(before.active, 'last activity of the active session').to.be.a('string');
      expect(before.idle, 'last activity of the idle session').to.be.a('string');
      cy.postActivityAPI(sessions.active.token).its('status').should('equal', 201);
      lastActivities().then(after => {
        expect(new Date(after.active as string).getTime())
          .to.be.greaterThan(new Date(before.active as string).getTime());
        expect(after.idle).to.equal(before.idle);
      });
    });
  });

  it('401 negative test: should not take a report without a login', () => {
    cy.postActivityAPI(noId).its('status').should('equal', 401);
  });
});
