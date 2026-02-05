import { RolePipe } from './role.pipe';

describe('RolePipe', () => {
  let pipe: RolePipe;

  beforeEach(() => {
    pipe = new RolePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "guest" for access level 0', () => {
    expect(pipe.transform(0)).toBe('guest');
  });

  it('should return "commenter" for access level 1', () => {
    expect(pipe.transform(1)).toBe('commenter');
  });

  it('should return "developer" for access level 2', () => {
    expect(pipe.transform(2)).toBe('developer');
  });

  it('should return "maintainer" for access level 3', () => {
    expect(pipe.transform(3)).toBe('maintainer');
  });

  it('should return "super" for access level 4', () => {
    expect(pipe.transform(4)).toBe('super');
  });

  it('should return undefined for access level 5 (out of bounds)', () => {
    expect(pipe.transform(5)).toBeUndefined();
  });

  it('should return undefined for negative access level', () => {
    expect(pipe.transform(-1)).toBeUndefined();
  });

  it('should return undefined for access level 10 (out of bounds)', () => {
    expect(pipe.transform(10)).toBeUndefined();
  });

  it('should handle all valid access levels', () => {
    const expectedRoles = ['guest', 'commenter', 'developer', 'maintainer', 'super'];

    expectedRoles.forEach((role, index) => {
      expect(pipe.transform(index)).toBe(role);
    });
  });
});
