import { apiAuth } from './api-auth';

describe('apiAuth', () => {
  it('should work', () => {
    expect(apiAuth()).toEqual('api-auth');
  });
});
