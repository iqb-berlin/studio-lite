import { Injectable } from '@nestjs/common';

/**
 * Empty. Registered as a provider in the app module and injected nowhere; who administers a group
 * is answered by {@link UsersService} and {@link WorkspaceGroupService}.
 */
@Injectable()
export class WorkspaceGroupAdminService {}
