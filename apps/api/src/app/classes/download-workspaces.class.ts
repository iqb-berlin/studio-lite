import {
  CodeBookContentSetting,
  MissingsProfilesDto
} from '@studio-lite-lib/api-dto';
import { BadRequestException } from '@nestjs/common';
import { CodebookGenerator, CodebookGenerationError } from '@iqb/ngx-coding-components/codebook-generator';
import type { UnitPropertiesForCodebook } from '@iqb/ngx-coding-components/codebook-models';
import { UnitService } from '../services/unit.service';
import { SettingService } from '../services/setting.service';

type Missing = {
  id: string;
  label: string;
  description: string;
  code: number;
};

export class DownloadWorkspacesClass {
  static async getWorkspaceCodingBook(
    workspaceId: number,
    unitService: UnitService,
    settingsService: SettingService,
    contentSetting: CodeBookContentSetting,
    unitList: number[]
  ): Promise<Buffer> {
    const units = await unitService.findAllWithProperties(workspaceId);
    const selectedUnits = units.filter(unit => unitList.includes(unit.id));
    const profiles = await settingsService.findMissingsProfiles();
    const missings = profiles.length ?
      this.getProfileMissings(profiles, contentSetting.missingsProfile) :
      [];
    const normalizedUnits: UnitPropertiesForCodebook[] = selectedUnits.map(unit => {
      // Metadata stores the source ID; documents display the coding alias.
      let aliases = new Map<string, string>();
      try {
        const schema = JSON.parse(unit.scheme || '{}');
        aliases = new Map((schema.variableCodings || [])
          .map((variable: { id: string; alias?: string }) => [variable.id, variable.alias || variable.id]));
      } catch { /* The shared generator reports malformed schemas with the unit key. */ }
      return {
        id: unit.id,
        key: unit.key,
        name: unit.name,
        scheme: unit.scheme || undefined,
        metadata: {
          items: (unit.metadata?.items || []).filter(item => item.id && item.variableId)
            .map(item => ({ id: item.id, variableId: aliases.get(item.variableId) || item.variableId }))
        }
      };
    });
    try {
      const blob = await CodebookGenerator.generateCodebook(normalizedUnits, contentSetting, missings);
      return Buffer.from(await blob.arrayBuffer());
    } catch (error) {
      if (error instanceof CodebookGenerationError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  private static getProfileMissings(
    profiles: MissingsProfilesDto[],
    missingsProfile: string
  ): Missing[] {
    let missings: Missing[] = [];
    try {
      const foundProfile = profiles.find(
        profile => profile.label === missingsProfile
      );
      if (foundProfile) {
        missings = JSON.parse(foundProfile.missings);
      }
    } catch {
      missings = [];
    }
    return missings;
  }
}
