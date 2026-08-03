import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line import/no-extraneous-dependencies
import { HttpService } from '@nestjs/axios';
import {
  catchError, firstValueFrom, map, of
} from 'rxjs';
import { LanguageCodedText } from '@iqbspecs/metadata-profile';
import { ProfilesRegistryDto } from '@studio-lite-lib/api-dto';
import RegisteredMetadataProfile from '../entities/registered-metadata-profile.entity';
import MetadataProfileRegistry from '../entities/metadata-profile-registry.entity';
import { SettingService } from './setting.service';
import { ProfilesRegistryNotAcceptableException } from '../exceptions/profiles-registry-not-acceptable.exception';

@Injectable()
export class RegisteredMetadataProfileService {
  constructor(
    @InjectRepository(MetadataProfileRegistry)
    private metadataProfileRegistryRepository: Repository<MetadataProfileRegistry>,
    @InjectRepository(RegisteredMetadataProfile)
    private registeredMetadataProfileRepository: Repository<RegisteredMetadataProfile>,
    private settingsService: SettingService,
    private http: HttpService) {}

  async getRegisteredMetadataProfiles(): Promise<RegisteredMetadataProfile[] | null> {
    const registryCsv = await this.getRegisteredMetadataProfilesAsCSV();
    if (registryCsv) {
      const profileUrls = RegisteredMetadataProfileService.getProfileUrls(registryCsv);
      return Promise
        .all(profileUrls
          .map(async url => {
            const storedProfile = await this.registeredMetadataProfileRepository
              .findOneBy({ url: url });
            if (storedProfile) {
              // without await to update the profile in the background
              this.updateRegisteredMetadataProfiles(url);
              return storedProfile;
            }
            const profile = await this.getProfileToRegister(url);
            if (profile) return this.storeRegisteredMetadataProfile(profile, url);
            return null;
          }));
    }
    return null;
  }

  private async updateRegisteredMetadataProfiles(url: string): Promise<void> {
    const profile = await this.getProfileToRegister(url);
    if (profile) this.storeRegisteredMetadataProfile(profile, url);
  }

  private async getRegisteredMetadataProfilesAsCSV(): Promise<string> {
    const profileRegistry: ProfilesRegistryDto = await this.settingsService.findUnitProfilesRegistry();
    const registry = await this.metadataProfileRegistryRepository
      .findOneBy({ id: profileRegistry.csvUrl });
    if (registry) {
      // Refreshed in the background: a transient fetch failure must not turn the
      // cache hit into an unhandled rejection (storeRegistry throws on a null csv).
      this.updateRegistry().catch(() => undefined);
      return registry.csv;
    }
    const registryCsv = await this.getRegistryCsv();
    await this.storeRegistry(registryCsv);
    return registryCsv;
  }

  private async updateRegistry(): Promise<void> {
    await this.storeRegistry(await this.getRegistryCsv());
  }

  private async getRegistryCsv(): Promise<string | null> {
    const profileRegistry: ProfilesRegistryDto = await this.settingsService.findUnitProfilesRegistry();
    return firstValueFrom(
      this.http.get<string>(profileRegistry.csvUrl)
        .pipe(
          catchError(() => of({ data: null })),
          map(result => result.data)
        )
    );
  }

  private async getProfileToRegister(url: string) {
    return firstValueFrom(
      this.http.get<RegisteredMetadataProfile>(url)
        .pipe(
          catchError(() => of({ data: null })),
          map(result => result.data)
        )
    );
  }

  // The newer registry format serves a profile directly ({ id, label, target, groups })
  // instead of a profile store ({ id, title, creator, maintainer, profiles }). Fill the
  // store fields with sensible defaults so both shapes can be persisted without hitting
  // the NOT NULL constraints (notably `creator`) on registered_metadata_profile.
  // Rows are keyed by the url the registry lists (the w3id) instead of the
  // document's self-declared id, which iqb-vocabs profiles still spell in the
  // github form (#1570) — the self-id must not leak back into the database.
  private static normalizeRegisteredProfile(
    profile: RegisteredMetadataProfile, url: string
  ): RegisteredMetadataProfile {
    const directProfile = profile as RegisteredMetadataProfile & { label?: LanguageCodedText[] };
    return {
      ...profile,
      id: url,
      url,
      title: profile.title?.length ? profile.title : (directProfile.label ?? []),
      creator: profile.creator ?? '',
      maintainer: profile.maintainer ?? '',
      profiles: profile.profiles ?? []
    };
  }

  // A refresh has to write the document it just fetched, not merely bump the
  // timestamp: otherwise upstream changes to a profile's label, title or groups
  // never reach the database, and a row written under a stale key (e.g. by an
  // instance from before #1570 during a rolling upgrade) could never be corrected.
  // `save` upserts on the primary key, so one call covers the first registration
  // and every later refresh alike.
  private async storeRegisteredMetadataProfile(
    rawProfile: RegisteredMetadataProfile, url: string
  ): Promise<RegisteredMetadataProfile> {
    const profile = RegisteredMetadataProfileService.normalizeRegisteredProfile(rawProfile, url);
    return this.registeredMetadataProfileRepository.save({ ...profile, modifiedAt: new Date() });
  }

  private async storeRegistry(csv: string | null): Promise<void> {
    if (!csv) {
      throw new ProfilesRegistryNotAcceptableException('csv', 'storeRegistry');
    }
    const profileRegistry: ProfilesRegistryDto = await this.settingsService.findUnitProfilesRegistry();
    const registry = await this.metadataProfileRegistryRepository
      .findOneBy({ id: profileRegistry.csvUrl });
    if (registry) {
      await this.metadataProfileRegistryRepository
        .save({ ...registry, csv: csv, modifiedAt: new Date() });
    } else {
      await this.createMetadataProfileRegistry(csv);
    }
  }

  private async createMetadataProfileRegistry(csv: string) {
    const profileRegistry: ProfilesRegistryDto = await this.settingsService.findUnitProfilesRegistry();
    const registry = this.metadataProfileRegistryRepository
      .create({ id: profileRegistry.csvUrl, csv, modifiedAt: new Date() });
    await this.metadataProfileRegistryRepository.save(registry);
  }

  // Extracts the profile URLs from the registry CSV. Resolves the "url" column by
  // header name so it tolerates layout changes (e.g. the added "target" column in the
  // newer registry format); falls back to the last column when no "url" header exists.
  private static getProfileUrls(csv: string): string[] {
    const lines = csv
      .trim()
      .split(/\r?\n/)
      .filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    const header = RegisteredMetadataProfileService.parseCsvRow(lines[0])
      .map(column => column.toLowerCase());
    const urlIndex = header.indexOf('url');
    return lines
      .slice(1)
      .map(line => {
        const fields = RegisteredMetadataProfileService.parseCsvRow(line);
        const value = urlIndex >= 0 ? fields[urlIndex] : fields[fields.length - 1];
        return (value ?? '').trim();
      })
      .filter(url => url !== '');
  }

  // Minimal RFC-4180-style CSV row parser: honours double-quoted fields (which may
  // contain commas) and escaped quotes (""), so quoted titles no longer corrupt the
  // column alignment.
  private static parseCsvRow(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current);
    return fields.map(field => field.trim());
  }
}
