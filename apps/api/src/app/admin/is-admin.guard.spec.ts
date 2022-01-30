import { IsAdminGuard } from './is-admin.guard';

describe('IsAdminGuard', () => {
  it('should be defined', () => {
    expect(new IsAdminGuard()).toBeDefined();
  });
});
