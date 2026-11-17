import { All, Controller, HttpException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

/**
 * `admin/*` and `group-admin/*` -- the prefixes #1216 removed. A frontend from before #1216 that is
 * still open in a browser after the update keeps asking for them: for the config on every visit to
 * the start page, and for whatever its current page shows. Until #1216 {@link AppVersionGuard}
 * answered the config with 521, which the frontend turns into the reload prompt; without this
 * controller the old frontend would get 404 everywhere and never be told to reload.
 *
 * The current frontend asks none of these paths, so whoever comes here is outdated and gets 521,
 * whatever the method and whatever version it names. Remove the controller with the release after
 * the one that ships #1216.
 */
@Controller(['admin', 'group-admin'])
@ApiExcludeController()
export class OutdatedFrontendController {
  // eslint-disable-next-line class-methods-use-this
  @All('*path')
  refuse(): never {
    throw new HttpException('Outdated frontend - reload the application.', 521);
  }
}
