import { NotFoundException } from '@nestjs/common';

/**
 * No user with this id, raised from the user administration. Like the other exceptions here it
 * carries id, controller and calling method into the response body, so the 404 says which route
 * looked for what -- see {@link HttpExceptionFilter}.
 */
export class AdminUserNotFoundException extends NotFoundException {
  constructor(userId: number, method: string) {
    const description = `Admin user with id ${userId} not found`;
    const objectOrError = {
      id: userId, controller: 'admin/users', method, description
    };
    super(objectOrError);
  }
}
