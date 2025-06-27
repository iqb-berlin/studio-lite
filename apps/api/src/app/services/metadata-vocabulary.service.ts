import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import {
  catchError, firstValueFrom, map, of
} from 'rxjs';
import { MetadataVocabularyDto } from '@studio-lite-lib/api-dto';
import MetadataVocabulary from '../entities/metadata-vocabulary.entity';

@Injectable()
export class MetadataVocabularyService {
  constructor(
    @InjectRepository(MetadataVocabulary)
    private metadataVocabularyRepository: Repository<MetadataVocabulary>,
    private http: HttpService) {}

  async getStoredMetadataVocabularyById(id: string): Promise<MetadataVocabularyDto | null> {
    const storedVocabulary = await this.metadataVocabularyRepository
      .findOneBy({ id: id });
    if (storedVocabulary) {
      // without await to update the stored vocabulary in the background
      this.getMetadataVocabulary(id);
      return storedVocabulary;
    }
    return this.getMetadataVocabulary(id);
  }

  private async getMetadataVocabulary(id: string): Promise<MetadataVocabularyDto | null> {
    const url = `${id}index.jsonld`;
    const vocabulary = await firstValueFrom(
      this.http.get<MetadataVocabularyDto>(url)
        .pipe(
          catchError(() => of({ data: null })),
          map(result => result.data)
        )
    );
    if (vocabulary) {
      await this.storeVocabulary(vocabulary, id);
    }
    return vocabulary;
  }

  private async storeVocabulary(vocabulary: MetadataVocabularyDto, id: string): Promise<void> {
    const metadataVocabulary = await this.metadataVocabularyRepository
      .findOneBy({ id: id });
    if (metadataVocabulary) {
      await this.metadataVocabularyRepository
        .save({ ...vocabulary, modifiedAt: new Date() });
    } else {
      await this.createMetadataVocabulary(vocabulary);
    }
  }

  private async createMetadataVocabulary(vocabulary: MetadataVocabularyDto) {
    const newMetadataVocabulary = this.metadataVocabularyRepository
      .create({ ...vocabulary, modifiedAt: new Date() });
    await this.metadataVocabularyRepository.save(newMetadataVocabulary);
  }
}
