import {
  UserData
} from '../../support/testData';

describe('API general tests', () => {
  const user2:UserData = {
    username: 'admin2',
    password: 'paso',
    isAdmin: false
  };
  // const group1: GroupData = {
  //   id: 'id_group1',
  //   name: 'VERA2022'
  // };
  // const group2: GroupData = {
  //   id: 'id_group2',
  //   name: 'GROUP2022'
  // };
  // const ws1: WsData = {
  //   id: 'id_ws1',
  //   name: '01Vorlage'
  // };
  // const ws2: WsData = {
  //   id: 'id_ws2',
  //   name: '02Vorlage'
  // };
  // const unit1: UnitData = {
  //   shortname: 'D01',
  //   name: 'Maus',
  //   group: ''
  // };
  // const unit2: UnitData = {
  //   shortname: 'D02',
  //   name: 'Hund',
  //   group: ''
  // };
  context('Positive tests', () => {
    // admin-auth
    it('1. should be able to add the first user /api/init-login', () => {
      cy.addFirstUserAPI()
        .then(resp => {
          Cypress.env(`token_${Cypress.env('username')}`, resp.body);
          expect(resp.status).to.equal(201);
        });
    });

    it('2. log in a valid user', () => {
      cy.loginAPI(Cypress.env('username'), Cypress.env('password'))
        .then(resp => {
          Cypress.env(`token_${Cypress.env('username')}`, resp.body);
          expect(resp.status).to.equal(201);
        });
    });

    it('3. should be able to retrieve user id', () => {
      cy.getUserIdAPI(Cypress.env('username'), Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          Cypress.env(`id_${Cypress.env('username')}`, resp.body.userId);
          expect(resp.status).to.equal(200);
        });
    });

    it('4. should be able to change the password for a user', () => {
      cy.updatePasswordAPI(Cypress.env(`token_${Cypress.env('username')}`), Cypress.env('password'), '4567')
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.loginAPI(Cypress.env('username'), '4567')
        .then(resp => {
          Cypress.env(`token_${Cypress.env('username')}`, resp.body);
          expect(resp.status).to.equal(201);
        });
      cy.updatePasswordAPI(Cypress.env(`token_${Cypress.env('username')}`), '4567', Cypress.env('password'))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
    it('5. should able to login with keycloak-login', () => {
      cy.request({
        method: 'POST',
        url: '/api/keycloak-login',
        headers: {
          'app-version': Cypress.env('version')
        },
        body: {
          description: '',
          email: 'xxx@hu-berlin.com',
          firstName: 'xxx',
          identity: 'xxx',
          isAdmin: 'false',
          issuer: 'https://www.iqb-login.de/realms/iqb',
          lasName: 'xxx',
          name: 'xxx',
          password: ''
        }
      }).then(resp => {
        Cypress.env('token_cloak', resp.body);
        const authorization = `bearer ${resp.body}`;
        expect(resp.status).to.equal(201); // We use dummy data, with real data we use code 201
        cy.request({
          method: 'GET',
          url: '/api/auth-data',
          headers: {
            'app-version': Cypress.env('version'),
            authorization
          }
        }).then(resp2 => {
          Cypress.env('id_key_login', resp2.body.userId);
          expect(resp2.status).to.equal(200);
        });
      });
    });
    it('6. should be able to delete a user with the id ', () => {
      cy.deleteUserAPI(Cypress.env('id_key_login'));
    });
    // admin-users
    it('7. should be able to create a new user and retrieve partial data', () => {
      cy.createUserAPI(user2)
        .then(res => {
          Cypress.env(user2.username, res.body);
          expect(res.status).to.equal(201);
          cy.getUsersAPI()
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.length).to.equal(2);
            });
        });
    });
    it('8. should be able to get the data of all users', () => {
      cy.getUsersFullAPI()
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(2);
        });
    });
    it('9. should able to retrieve the data of a specific user', () => {
      cy.getUserAPI(Cypress.env(user2.username))
        .then(resp => {
          expect(resp.body.name).to.equal(user2.username);
        });
    });
    it('10. should able to retrieve the data of a specific user', () => {
      cy.getUserAPI(Cypress.env(user2.username))
        .then(resp => {
          expect(resp.body.name).to.equal(user2.username);
        });
    });
    it('11. should to retrieve the workspaces of a user (admin). /api/admin/users/{id}/workspaces', () => {
      cy.getWsByUserAPI(Cypress.env(user2.username))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // TODO INSERT WS AND CHECK THE SIZE AFTER THAT
          // expect(resp.body.length).to.equal(0);
        });
    });

    it('109. should be able to delete residuals', () => {
      cy.pause();
      cy.deleteUserAPI(Cypress.env(user2.username));
    });
    it('110. should be able to add the first user', () => {
      cy.deleteFirstUserAPI().then(resp => {
        Cypress.env('token_admin', '');
        expect(resp.status).to.equal(200);
      });
    });
  });

  context('Negative tests', () => {

  });
});
