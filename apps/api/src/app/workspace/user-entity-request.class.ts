import UserEntity from '../database/entities/user.entity';

export class UserEntityRequest extends Request {
  user: UserEntity;
}
