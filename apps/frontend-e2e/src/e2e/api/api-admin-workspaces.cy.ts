import { addModules, login } from '../../support/util';


describe('Admin settings, resource packages and verona-modules  API tests', () => {
  const modules:string[] = ['iqb-schemer-2.0.0-beta.html',
    'iqb-editor-aspect-2.5.0-beta5.html',
    'iqb-player-aspect-2.5.0-beta5.html'];
  //  const module = modules[0].replace(/-+(?=[^-\d]*\d)/, '%40').replace(/.html$/, '');
  //  const moduleAt = module.replace('%40', '@');
  const noId: string = '9988';
  // 32
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
      });
  });
  after(() => {
    cy.deleteFirstUserAPI().then(resp => {
      Cypress.env('token_admin', '');
      expect(resp.status).to.equal(200);
    });
  });
});
