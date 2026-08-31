import { CustomDecorator, SetMetadata } from '@nestjs/common';

/** Metadata key under which {@link AnyWorkspaceGroupAdmin} stores its marking for the guard to read. */
export const ANY_WORKSPACE_GROUP_ADMIN_KEY = 'anyWorkspaceGroupAdmin';

/**
 * Marks a route that is open to the admin of ANY workspace group, because it is about no single
 * group: the lists of the group-admin area, and the routes that name what they act on in the body
 * or the query rather than in the path.
 *
 * Without this marking {@link IsWorkspaceGroupAdminGuard} refuses a route it cannot resolve a group
 * for. The marking is therefore a deliberate statement, not a formality: it says that the route
 * either needs no group or checks the group itself, further in.
 */
export const AnyWorkspaceGroupAdmin = (): CustomDecorator => SetMetadata(ANY_WORKSPACE_GROUP_ADMIN_KEY, true);
