import {
  CanActivate, ExecutionContext, HttpException, Inject, Injectable
} from '@nestjs/common';

@Injectable()
export class AppVersionGuard implements CanActivate {
  constructor(
    @Inject('APP_VERSION') readonly appVersion: string
  ) {}

  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const headerAppVersion = req.headers['app-version'];
    const canAccess = headerAppVersion === this.appVersion;
    if (!canAccess) {
      throw new HttpException(
        `Unexpected app version: ${headerAppVersion} - must be ${this.appVersion}`, 521
      );
    }
    return true;
  }
}

export const AppVersionProvider = {
  provide: 'APP_VERSION',
  useValue: '2.1.0'
};
