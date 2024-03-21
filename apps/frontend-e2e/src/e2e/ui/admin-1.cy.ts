import { addFirstUser, visitLoginPage } from '../../support/util';

describe('Admin first test', () => {
  visitLoginPage();
  addFirstUser();
});
