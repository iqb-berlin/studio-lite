import { randomSessionId } from './session-id.utils';

describe('randomSessionId', () => {
  // The API opens a session under an id of this form only, and under a random one otherwise (#2151).
  // An installation served over plain HTTP has no crypto.randomUUID.
  it('should have the form the API takes, without crypto.randomUUID', () => {
    const descriptor = Object.getOwnPropertyDescriptor(crypto, 'randomUUID');
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
    try {
      expect(randomSessionId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    } finally {
      if (descriptor) {
        Object.defineProperty(crypto, 'randomUUID', descriptor);
      } else {
        delete (crypto as { randomUUID?: unknown }).randomUUID;
      }
    }
  });

  // Two browsers of the same person would otherwise share one session.
  it('should differ from call to call', () => {
    expect(randomSessionId()).not.toBe(randomSessionId());
  });
});
