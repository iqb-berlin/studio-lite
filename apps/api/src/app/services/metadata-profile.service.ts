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

  private vocabularyCache = new Map<string, MetadataVocabularyDto>();
  private profileCache = new Map<string, MetadataProfileDto>(); // Neuer Cache

  async getMetadataProfile(url: string): Promise<MetadataProfileDto | null> {
    if (this.profileCache.has(url)) {
      return this.profileCache.get(url) || null;
    }

    const profile = await firstValueFrom(
      this.http.get<MetadataProfileDto>(url).pipe(
        catchError(() => of({ data: null })), // Fehler abfangen
        map(result => result.data) // Antwortdaten extrahieren
      )
    );

    if (profile) {
      this.profileCache.set(url, profile);
      await this.storeProfile(profile, url);
    } else {
      const storedProfile = await this.metadataProfileRepository.findOneBy({ id: url });
      if (storedProfile) {
        this.profileCache.set(url, storedProfile); // Profil aus der DB in Cache legen
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
      .flatMap(group => group.entries)
      .filter(entry => (entry.type === 'vocabulary'))
      .map(entry => (entry.parameters as unknown as ProfileEntryParametersVocabulary).url);
    await Promise.all(vocabularyIds.map(async id => {
      const vocabulary = this.vocabularyCache.get(id) ??
        await (async () => {
          const fetchedVocabulary = await this.metadataVocabularyService.getMetadataVocabularyById(id);
          this.vocabularyCache.set(id, fetchedVocabulary);
          return fetchedVocabulary;
        })();

      vocabularies.push(vocabulary);
    }));
    return vocabularies;
  }
}
