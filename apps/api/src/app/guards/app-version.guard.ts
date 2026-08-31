import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable
} from '@nestjs/common';

/**
 * Refuses any request whose `app-version` header does not name exactly the version this server
 * belongs to. What it catches is a frontend left over in a browser after an update: it would talk
 * to the new server with the old contract, and the failures that produces are hard to read.
 *
 * The refusal uses the non-standard status 521, which the frontend answers with the reload prompt.
 * A 4xx would be swallowed by the ordinary error handling.
 */
@Injectable()
export class AppVersionGuard implements CanActivate {
  /** @param appVersion The version this build was released as, see {@link AppVersionProvider}. */
  constructor(@Inject('APP_VERSION') readonly appVersion: string) {
  }

  /** Passes only on an exact match; a missing header is a mismatch like any other. */
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const headerAppVersion = req.headers['app-version'];
    const canAccess = headerAppVersion === this.appVersion;
    if (!canAccess) {
      throw new HttpException(
        `Unexpected app version: ${headerAppVersion} - must be ${this.appVersion}`,
        521
      );
    }
    return true;
  }
}

/**
 * The version {@link AppVersionGuard} compares against. The frontend hands the same literal to its
 * own `APP_VERSION` provider (`apps/frontend/src/main.ts`), and both are raised with the release
 * version in package.json — three places kept in step by hand, so an edit here is only half the
 * change.
 */
export const AppVersionProvider = {
  provide: 'APP_VERSION',
  useValue: '19.0.0'
};
