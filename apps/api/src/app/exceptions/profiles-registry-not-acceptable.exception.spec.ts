import { ProfilesRegistryNotAcceptableException } from './profiles-registry-not-acceptable.exception';

describe('ProfilesRegistryNotAcceptableException', () => {
  it('should be defined', () => {
    const exception = new ProfilesRegistryNotAcceptableException('key', 'method');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(406);
    expect(exception.getResponse()).toEqual({
      id: 'key',
      controller: 'metadata',
      method: 'method',
      description: 'Profiles registry with key key not acceptable'
    });
  });
});
