import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createMock } from '@golevelup/ts-jest';
import { AuthService } from '../services/auth.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const build = () => {
    const get = jest.fn(() => 'test-secret');
    const authService = createMock<AuthService>();
    authService.hasValidSession.mockResolvedValue(true);
    const strategy = new JwtStrategy(createMock<ConfigService>({ get }), authService);
    return { strategy, authService, get };
  };

  it('uses JWT_SECRET from config', () => {
    const { get } = build();

    expect(get).toHaveBeenCalledWith('JWT_SECRET');
  });

  it('maps the payload of a token whose session is still active', async () => {
    const { strategy, authService } = build();

    await expect(strategy.validate({
      sub: 12, username: 'alice', sub2: 0, sid: 'session-1'
    })).resolves.toEqual({
      id: 12,
      name: 'alice',
      reviewId: 0,
      sessionId: 'session-1'
    });
    expect(authService.hasValidSession).toHaveBeenCalledWith(12, 'session-1');
  });

  // Another browser of the account went on working for up to 30 minutes after a new password
  // ended every session (#2115).
  it('refuses a token whose session has ended (#2115)', async () => {
    const { strategy, authService } = build();
    authService.hasValidSession.mockResolvedValue(false);

    await expect(strategy.validate({
      sub: 12, username: 'alice', sub2: 0, sid: 'session-1'
    })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuses a token of an account that names no session', async () => {
    const { strategy, authService } = build();

    await expect(strategy.validate({ sub: 12, username: 'alice', sub2: 0 }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(authService.hasValidSession).not.toHaveBeenCalled();
  });

  it('takes a review login at its word, as it has no session', async () => {
    const { strategy, authService } = build();

    await expect(strategy.validate({
      sub: 0, username: '', sub2: 34, sid: 'session-2'
    })).resolves.toEqual({
      id: 0,
      name: '',
      reviewId: 34,
      sessionId: 'session-2'
    });
    expect(authService.hasValidSession).not.toHaveBeenCalled();
  });

  // Answered with a 401, a database outage would log out every browser.
  it('passes an error of the session lookup on instead of refusing the token', async () => {
    const { strategy, authService } = build();
    const outage = new Error('connection lost');
    authService.hasValidSession.mockRejectedValue(outage);

    await expect(strategy.validate({
      sub: 12, username: 'alice', sub2: 0, sid: 'session-1'
    })).rejects.toBe(outage);
  });
});
