import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line import/no-extraneous-dependencies
import { HttpService } from '@nestjs/axios';
import {
  catchError, firstValueFrom, map, of
} from 'rxjs';
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
      const profileUrls = RegisteredMetadataProfileService.getProfileUrls(registryCsv, '"');
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
      this.updateRegistry();
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

  private async storeRegisteredMetadataProfile(
    profile: RegisteredMetadataProfile, url: string
  ): Promise<RegisteredMetadataProfile> {
    const storedProfile = await this.registeredMetadataProfileRepository
      .findOneBy({ id: profile.id });
    if (storedProfile) {
      await this.registeredMetadataProfileRepository
        .save({ ...storedProfile, modifiedAt: new Date() });
    } else {
      return this.createRegisteredMetadataProfile(profile, url);
    }
    return storedProfile;
  }

  private async createRegisteredMetadataProfile(profile: RegisteredMetadataProfile, url: string) {
    const newProfile = this.registeredMetadataProfileRepository
      .create({ ...profile, url, modifiedAt: new Date() });
    return this.registeredMetadataProfileRepository.save(newProfile);
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

  private static getProfileUrls(stringVal:string, splitter:string): string[] {
    const [, ...rest] = stringVal
      .trim()
      .split('\n')
      .map(item => item.split(splitter));
    const storesArray = rest.map(e => e.filter(el => (el !== ',' && el !== '')));
    return storesArray.map(store => store[2].replace(',', ''));
  }
}
