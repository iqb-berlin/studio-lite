import { Reflector } from '@nestjs/core';
import { BackgroundRequest, BACKGROUND_REQUEST_KEY } from './background-request.decorator';

describe('BackgroundRequestDecorator', () => {
  const reflector = new Reflector();

  // Read back through Reflector rather than inspecting the metadata call: that is how the
  // interceptor reads it, so the test breaks if the two ever disagree about the key.
  /* eslint-disable class-methods-use-this */
  class Routes {
    @BackgroundRequest()
    always(): void {}

    @BackgroundRequest('unless-user-intent')
    unlessUserIntent(): void {}

    unmarked(): void {}
  }
  /* eslint-enable class-methods-use-this */

  it('should default to always', () => {
    expect(reflector.get(BACKGROUND_REQUEST_KEY, Routes.prototype.always)).toBe('always');
  });

  it('should carry the explicit mode', () => {
    const mode = reflector.get(BACKGROUND_REQUEST_KEY, Routes.prototype.unlessUserIntent);
    expect(mode).toBe('unless-user-intent');
  });

  it('should leave an unmarked route without metadata', () => {
    expect(reflector.get(BACKGROUND_REQUEST_KEY, Routes.prototype.unmarked)).toBeUndefined();
  });
});
