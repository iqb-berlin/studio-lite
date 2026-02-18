import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

type JwtPayload = {
  sub: number;
  username: string;
  sub2: number;
};

describe('JwtStrategy', () => {
  it('uses JWT_SECRET from config', () => {
    const get = jest.fn(() => 'test-secret');
    const configService: Pick<ConfigService, 'get'> = { get };

    const strategy = new JwtStrategy(configService as ConfigService);

    expect(strategy).toBeDefined();
    expect(get).toHaveBeenCalledWith('JWT_SECRET');
  });

  it('maps payload to user object', async () => {
    const configService: Pick<ConfigService, 'get'> = {
      get: jest.fn(() => 'test-secret')
    };
    const strategy = new JwtStrategy(configService as ConfigService);

    const payload: JwtPayload = { sub: 12, username: 'alice', sub2: 34 };

    await expect(strategy.validate(payload)).resolves.toEqual({
      id: 12,
      name: 'alice',
      reviewId: 34
    });
  });
});
