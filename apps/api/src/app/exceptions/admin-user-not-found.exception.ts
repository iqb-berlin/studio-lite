import { NotFoundException } from '@nestjs/common';

export class AdminUserNotFoundException extends NotFoundException {
  constructor(userId: number, method: string) {
    const description = `Admin user with id ${userId} not found`;
    const objectOrError = {
      id: userId, controller: 'admin/users', method, description
    };
    super(objectOrError);
  }
}
