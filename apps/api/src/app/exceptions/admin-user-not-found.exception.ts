import { NotFoundException } from '@nestjs/common';

export class AdminUserNotFoundException extends NotFoundException {
  constructor(userId: number) {
    const description = `Admin user with id ${userId} not found`;
    const objectOrError = { id: userId, controller: 'admin/users', description };
    super(objectOrError);
  }
}
