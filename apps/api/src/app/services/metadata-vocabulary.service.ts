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

/**
 * The controlled vocabularies a profile's fields draw their values from, cached much like the
 * profiles themselves ({@link MetadataProfileService}): read from the database, refreshed in the
 * background, fetched on first use.
 *
 * A vocabulary is addressed by its URL, and one that does not name a document itself is asked for
 * its `index.jsonld`. A fetch that fails is retried and then given up on with a warning: the studio
 * keeps working with the copy it has.
 *
 * One difference from the profile service: the background refresh is started without a `catch`, so
 * a rejection from the write -- not from the fetch, which is handled -- escapes the read path as an
 * unhandled rejection.
 */
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
      // without await to update the stored vocabulary in the background; a failed fetch or a failed
      // write must not escape as an unhandled rejection on a read path (as in MetadataProfileService)
      this.getMetadataVocabulary(id).catch(() => undefined);
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

  /**
   * One upsert rather than a lookup followed by an insert or a save: two parallel requests for the
   * same vocabulary both saw nothing and both inserted. That is the normal case, not a rare one --
   * getProfileVocabularies resolves a profile's vocabularies with Promise.all and the item profiles
   * name the same vocabulary more than once. Now that the table has its primary key, the loser of
   * that race would fail on the duplicate key instead of quietly adding another row.
   */
  private async storeVocabulary(vocabulary: MetadataVocabularyDto): Promise<void> {
    await this.metadataVocabularyRepository
      .upsert({ ...vocabulary, modifiedAt: new Date() }, ['id']);
  }
}
