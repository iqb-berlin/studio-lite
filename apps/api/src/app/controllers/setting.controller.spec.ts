import { SettingController } from './setting.controller';
import { AppVersionGuard } from '../guards/app-version.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('SettingController', () => {
  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it('should only ask for a current app version at findConfig', () => {
    expect(Reflect.getMetadata('__guards__', SettingController.prototype.findConfig))
      .toEqual([AppVersionGuard]);
  });

  it.each([
    'patchConfig',
    'patchAppLogo',
    'patchUnitExportConfig',
    'patchProfilesRegistry',
    'findEmailTemplate',
    'patchEmailTemplate',
    'patchMissingsProfiles',
    'findUnitRichNoteTagsConfig',
    'patchUnitRichNoteTags'
  ] as const)(
    'should let only administrators reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', SettingController.prototype[method]))
        .toEqual([JwtAuthGuard, IsAdminGuard]);
    }
  );

  it.each([
    'findUnitExportConfig',
    'findUnitProfilesRegistry',
    'findMissingsProfiles',
    'findUnitRichNoteTags'
  ] as const)(
    'should let any signed-in user reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', SettingController.prototype[method]))
        .toEqual([JwtAuthGuard]);
    }
  );
});
