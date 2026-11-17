import { HttpException } from '@nestjs/common';
import { OutdatedFrontendController } from './outdated-frontend.controller';

describe('OutdatedFrontendController', () => {
  // A frontend from before #1216 asks for the config before anyone has logged in; a token guard
  // would answer 401 and the reload prompt would never come.
  it('should answer without asking for a login', () => {
    expect(Reflect.getMetadata('__guards__', OutdatedFrontendController.prototype.refuse))
      .toBeUndefined();
  });

  it('should answer 521, which the frontend turns into the reload prompt (#1216)', () => {
    const controller = new OutdatedFrontendController();
    let status: number | undefined;
    try {
      controller.refuse();
    } catch (error) {
      status = (error as HttpException).getStatus();
    }
    expect(status).toBe(521);
  });
});
