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
      await this.storeVocabulary(vocabulary);
    }
    return vocabulary;
  }

  // One upsert rather than a lookup followed by an insert or a save: two parallel
  // requests for the same vocabulary both saw nothing and both inserted. That is the
  // normal case, not a rare one -- getProfileVocabularies resolves a profile's
  // vocabularies with Promise.all and the item profiles name the same vocabulary
  // more than once. Now that the table has its primary key, the loser of that race
  // would fail on the duplicate key instead of quietly adding another row.
  private async storeVocabulary(vocabulary: MetadataVocabularyDto): Promise<void> {
    await this.metadataVocabularyRepository
      .upsert({ ...vocabulary, modifiedAt: new Date() }, ['id']);
  }
}
