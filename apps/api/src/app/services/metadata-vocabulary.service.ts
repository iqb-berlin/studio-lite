import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import {
  catchError, firstValueFrom, map, of, retry
} from 'rxjs';
import { MetadataVocabularyDto } from '@studio-lite-lib/api-dto';
import MetadataVocabulary from '../entities/metadata-vocabulary.entity';

// The vocabulary hosts answer a burst of parallel requests with an occasional
// connection reset. One lost vocabulary costs the caller the whole profile, so
// a transport error is worth a second and third try before giving up.
const FETCH_RETRIES = 2;
const FETCH_RETRY_DELAY_MS = 300;

@Injectable()
export class MetadataVocabularyService {
  private readonly logger = new Logger(MetadataVocabularyService.name);

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
    const url = id.endsWith('.json') || id.endsWith('.jsonld') ? id : `${id}index.jsonld`;
    const vocabulary = await firstValueFrom(
      this.http.get<MetadataVocabularyDto>(url)
        .pipe(
          retry({ count: FETCH_RETRIES, delay: FETCH_RETRY_DELAY_MS }),
          catchError(error => {
            this.logger.warn(`Could not load vocabulary ${url}: ${error?.message ?? error}`);
            return of({ data: null });
          }),
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
