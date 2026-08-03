import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import {
  catchError, firstValueFrom, map, of
} from 'rxjs';
import { MetadataProfileDto, MetadataVocabularyDto } from '@studio-lite-lib/api-dto';
import { ProfileEntryParametersVocabulary } from '@iqbspecs/metadata-profile';
import MetadataProfile from '../entities/metadata-profile.entity';
import { MetadataVocabularyService } from './metadata-vocabulary.service';

@Injectable()
export class MetadataProfileService {
  constructor(
    @InjectRepository(MetadataProfile)
    private metadataProfileRepository: Repository<MetadataProfile>,
    private metadataVocabularyService: MetadataVocabularyService,
    private http: HttpService) {}

  async getStoredMetadataProfile(url: string): Promise<MetadataProfileDto | null> {
    const storedProfile = await this.metadataProfileRepository
      .findOneBy({ id: url });
    if (storedProfile) {
      // without await to update the profile in the background; a failed fetch or
      // a failed write must not escape as an unhandled rejection on a read path
      this.getMetadataProfile(url).catch(() => undefined);
      return storedProfile;
    }
    return this.getMetadataProfile(url);
  }

  // DB-only read (no background network refresh). For hot read paths that only
  // need the stored profile definition — e.g. resolving hideNumbering per entry
  // when building the display text — so a units list does not spam the profile
  // host with one fetch per unit.
  getStoredMetadataProfileFromDb(url: string): Promise<MetadataProfile | null> {
    return this.metadataProfileRepository.findOneBy({ id: url });
  }

  // The profile is cached and returned under the url it was requested by, not
  // under its self-declared id: iqb-vocabs profiles still declare the github
  // spelling while the app references them by w3id (#1570). Keying by the
  // self-id would leave the w3id row stale forever and pile up duplicates.
  private async getMetadataProfile(url: string): Promise<MetadataProfileDto | null> {
    const profile = await firstValueFrom(
      this.http.get<MetadataProfileDto>(url)
        .pipe(
          catchError(() => of({ data: null })),
          map(result => result.data)
        )
    );
    if (profile) {
      const keyedProfile = { ...profile, id: url };
      await this.storeProfile(keyedProfile);
      return keyedProfile;
    }
    return profile;
  }

  // `save` upserts on the primary key (`id`), so it covers both the first fetch
  // and every background refresh — no separate existence check is needed.
  private async storeProfile(profile: MetadataProfileDto): Promise<void> {
    await this.metadataProfileRepository.save({ ...profile, modifiedAt: new Date() });
  }

  async getProfileVocabularies(url: string): Promise<MetadataVocabularyDto[]> {
    const profile = await this.getStoredMetadataProfile(url);
    const vocabularies: MetadataVocabularyDto[] = [];
    const vocabularyIds = profile.groups
      .map(group => group.entries)
      .flat()
      .filter(entry => entry.type.toLowerCase() === 'vocabulary')
      .map(
        entry => (entry.parameters as unknown as ProfileEntryParametersVocabulary).url
      );
    await Promise.all(vocabularyIds
      .map(async id => {
        vocabularies.push(await this.metadataVocabularyService.getStoredMetadataVocabularyById(id));
      }));
    return vocabularies;
  }
}
