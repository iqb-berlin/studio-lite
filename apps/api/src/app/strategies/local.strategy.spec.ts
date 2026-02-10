import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  const buildAuthService = () => {
    const validateUser = jest.fn<Promise<number | null>, [string, string]>();
    const validateReview = jest.fn<Promise<number | null>, [string, string]>();
    const authService: Pick<AuthService, 'validateUser' | 'validateReview'> = {
      validateUser,
      validateReview
    };

    return { authService: authService as AuthService, validateUser, validateReview };
  };

  it('returns user data when user credentials are valid', async () => {
    const { authService, validateUser, validateReview } = buildAuthService();
    validateUser.mockResolvedValue(42);

    const strategy = new LocalStrategy(authService);

    await expect(strategy.validate('user', 'pass')).resolves.toEqual({
      id: 42,
      name: 'user',
      reviewId: 0
    });
    expect(validateReview).not.toHaveBeenCalled();
  });

  it('returns review data when review credentials are valid', async () => {
    const { authService, validateUser, validateReview } = buildAuthService();
    validateUser.mockResolvedValue(null);
    validateReview.mockResolvedValue(7);

    const strategy = new LocalStrategy(authService);

    await expect(strategy.validate('review', 'secret')).resolves.toEqual({
      id: 0,
      name: '',
      reviewId: 7
    });
  });

  it('throws UnauthorizedException when credentials are invalid', async () => {
    const { authService, validateUser, validateReview } = buildAuthService();
    validateUser.mockResolvedValue(null);
    validateReview.mockResolvedValue(null);

    const strategy = new LocalStrategy(authService);

    await expect(strategy.validate('nope', 'nope')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
