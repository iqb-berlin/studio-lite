import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line import/no-extraneous-dependencies
import { HttpService } from '@nestjs/axios';
import {
  catchError, firstValueFrom, map, of
} from 'rxjs';
import RegisteredMetadataProfile from '../entities/registered-metadata-profile.entity';
import MetadataProfileRegistry from '../entities/metadata-profile-registry.entity';

@Injectable()
export class RegisteredMetadataProfileService {
  PROFILE_REGISTRY = 'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv';
  constructor(
    @InjectRepository(MetadataProfileRegistry)
    private metadataProfileRegistryRepository: Repository<MetadataProfileRegistry>,
    @InjectRepository(RegisteredMetadataProfile)
    private registeredMetadataProfileRepository: Repository<RegisteredMetadataProfile>,
    private http: HttpService) {}

  async getRegisteredMetadataProfiles(): Promise<RegisteredMetadataProfile[] | null> {
    let registryCsv = await this.getRegistryCsv();
    if (registryCsv) {
      await this.storeRegistry(registryCsv);
    } else {
      const registry = await this.metadataProfileRegistryRepository
        .findOneBy({ id: this.PROFILE_REGISTRY });
      if (registry) {
        registryCsv = registry.csv;
      }
    }
    if (registryCsv) {
      const profileUrls = RegisteredMetadataProfileService.getProfileURLs(registryCsv, '"');
      return Promise
        .all(profileUrls
          .map(async url => {
            const profile = await this.getProfileToRegister(url);
            if (profile) return this.storeRegisteredMetadataProfile(profile, url);
            const storedProfile = await this.registeredMetadataProfileRepository
              .findOneBy({ url: url });
            if (storedProfile) return storedProfile;
            return null;
          }));
    }
    return null;
  }

  private getRegistryCsv(): Promise<string | null> {
    return firstValueFrom(
      this.http.get<string>(this.PROFILE_REGISTRY)
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

  private async storeRegistry(csv: string): Promise<void> {
    const registry = await this.metadataProfileRegistryRepository
      .findOneBy({ id: this.PROFILE_REGISTRY });
    if (registry) {
      await this.metadataProfileRegistryRepository
        .save({ ...registry, modifiedAt: new Date() });
    } else {
      await this.createMetadataProfileRegistry(csv);
    }
  }

  private async createMetadataProfileRegistry(csv: string) {
    const registry = this.metadataProfileRegistryRepository
      .create({ id: this.PROFILE_REGISTRY, csv, modifiedAt: new Date() });
    await this.metadataProfileRegistryRepository.save(registry);
  }

  private static getProfileURLs(stringVal:string, splitter:string): string[] {
    const [, ...rest] = stringVal
      .trim()
      .split('\n')
      .map(item => item.split(splitter));
    const storesArray = rest.map(e => e.filter(el => (el !== ',' && el !== '')));
    return storesArray.map(store => store[2].replace(',', ''));
  }
}
