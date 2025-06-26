import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line import/no-extraneous-dependencies
import { HttpService } from '@nestjs/axios';
import {
  catchError, firstValueFrom, map, of
} from 'rxjs';
import { MetadataProfileDto, MetadataVocabularyDto } from '@studio-lite-lib/api-dto';
import { ProfileEntryParametersVocabulary } from '@iqb/metadata/md-profile-entry';
import MetadataProfile from '../entities/metadata-profile.entity';
import { MetadataVocabularyService } from './metadata-vocabulary.service';

@Injectable()
export class MetadataProfileService {
  constructor(
    @InjectRepository(MetadataProfile)
    private metadataProfileRepository: Repository<MetadataProfile>,
    private metadataVocabularyService: MetadataVocabularyService,
    private http: HttpService) {}

  async getMetadataProfile(url: string): Promise<MetadataProfileDto | null> {
    const profile = await firstValueFrom(
      this.http.get<MetadataProfileDto>(url)
        .pipe(
          catchError(() => of({ data: null })),
          map(result => result.data)
        )
    );
    if (profile) {
      await this.storeProfile(profile, url);
    } else {
      const storedProfile = await this.metadataProfileRepository
        .findOneBy({ id: url });
      if (storedProfile) {
        return storedProfile;
      }
    }
    return profile;
  }

  private async storeProfile(profile: MetadataProfileDto, url: string): Promise<void> {
    const metadataProfile = await this.metadataProfileRepository
      .findOneBy({ id: url });
    if (metadataProfile) {
      await this.metadataProfileRepository
        .save({ ...profile, modifiedAt: new Date() });
    } else {
      await this.createMetadataProfile(profile);
    }
  }

  private async createMetadataProfile(profile: MetadataProfileDto) {
    const newMetadataProfile = this.metadataProfileRepository
      .create({ ...profile, modifiedAt: new Date() });
    await this.metadataProfileRepository.save(newMetadataProfile);
  }

  async getProfileVocabularies(url: string): Promise<MetadataVocabularyDto[]> {
    const profile = await this.getMetadataProfile(url);
    const vocabularies: MetadataVocabularyDto[] = [];
    const vocabularyIds = profile.groups
      .map(group => group.entries)
      .flat()
      .filter(entry => (entry.type === 'vocabulary'))
      .map(entry => (entry.parameters as unknown as ProfileEntryParametersVocabulary).url);
    await Promise.all(vocabularyIds
      .map(async id => {
        vocabularies.push(await this.metadataVocabularyService.getStoredMetadataVocabularyById(id));
      }));
    return vocabularies;
  }
}
