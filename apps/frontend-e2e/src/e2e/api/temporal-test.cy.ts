import { UserData } from '../../support/testData';

describe('Admin settings API tests', () => {
  const user2: UserData = {
    username: 'user',
    password: 'paso',
    isAdmin: false
  };
  const modules:string[] = ['iqb-schemer-2.5.3.html',
    'iqb-editor-aspect-2.9.1.html',
    'iqb-player-aspect-2.9.1.html'];
  before(() => {
    cy.addFirstUserAPI(Cypress.env('username'), Cypress.env('password'))
      .then(resp => {
        Cypress.env(`token_${Cypress.env('username')}`, resp.body);
        expect(resp.status).to.equal(201);
        cy.getUserIdAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp2 => {
            Cypress.env(`id_${Cypress.env('username')}`, resp2.body.userId);
            expect(resp2.status).to.equal(200);
          });
        cy.createUserAPI(user2, Cypress.env(`token_${Cypress.env('username')}`))
          .then(res => {
            Cypress.env(`id_${user2.username}`, res.body);
            expect(res.status).to.equal(201);
            cy.loginAPI(user2.username, user2.password)
              .then(resp3 => {
                Cypress.env(`token_${user2.username}`, resp3.body);
                expect(resp3.status).to.equal(201);
              });
          });
      });
  });
  after(() => {
    cy.pause();
    cy.deleteUserAPI(Cypress.env(`id_${user2.username}`), Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(200);
      });
    cy.deleteUserAPI(Cypress.env(`id_${Cypress.env('username')}`), Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        Cypress.env('token_admin', '');
        expect(resp.status).to.equal(200);
      });
  });
  it('500 positive test: load a module ', () => {
    cy.addModuleAPI(modules[0], Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(500);
      });
    cy.pause();
  });
});
