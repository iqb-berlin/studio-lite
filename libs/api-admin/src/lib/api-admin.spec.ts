import { apiAdmin } from './api-admin';

describe('apiAdmin', () => {
  it('should work', () => {
    expect(apiAdmin()).toEqual('api-admin');
  });
});
