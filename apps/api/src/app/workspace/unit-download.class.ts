import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import * as AdmZip from 'adm-zip';
import { WorkspaceService } from '../database/services/workspace.service';

export class UnitDownloadClass {
  static async get(workspaceService: WorkspaceService, unitExportSettings: UnitDownloadSettingsDto): Promise<Buffer> {
    const zip = new AdmZip();
    zip.addFile('settings.json', Buffer.from(JSON.stringify(unitExportSettings)));
    return zip.toBuffer();
  }
}
