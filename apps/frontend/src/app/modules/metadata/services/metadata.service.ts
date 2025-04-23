import { Inject, Injectable } from '@angular/core';
import { MDProfile, MDProfileGroup } from '@iqb/metadata';
import { ProfileEntryParametersVocabulary } from '@iqb/metadata/md-profile-entry';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TopConcept, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { MetadataBackendService } from './metadata-backend.service';
import { WorkspaceService } from '../../workspace/services/workspace.service';
import {
  Vocab, VocabData, VocabIdDictionaryValue
} from '../models/vocabulary.class';

@Injectable({
  providedIn: 'root'
})

export class MetadataService {
  idLabelDictionary: Record<string, VocabIdDictionaryValue> = {};
  vocabulariesIdDictionary: Record<string, VocabIdDictionaryValue> = {};
  vocabularies: Vocab[] = [];
  unitProfileColumns:MDProfileGroup[] = [];
  itemProfileColumns:MDProfileGroup = {} as MDProfileGroup;

  constructor(@Inject('SERVER_URL') private readonly serverUrl: string,
              private backendService: MetadataBackendService,
              private workspaceService: WorkspaceService,
              private http: HttpClient) {
  }

  async loadProfileVocabularies(profile: MDProfile): Promise<boolean> {
    return new Promise(resolve => {
      this.backendService.getMetadataVocabulariesForProfile(profile.id)
        .subscribe(metadataVocabularies => {
          if (metadataVocabularies && metadataVocabularies !== true &&
            !metadataVocabularies.some(vocabulary => vocabulary === null)) {
            const vocabularies: Vocab[] = metadataVocabularies
              .map(vocabulary => ({
                data: vocabulary,
                url: vocabulary.id
              }));
            vocabularies.forEach(vocabulary => {
              if (!this.vocabularies.find(v => v.url === vocabulary.url)) {
                this.vocabularies.push(vocabulary);
              }
            });
            const vocabularyEntryParams = profile.groups
              .map(group => group.entries)
              .flat()
              .filter(entry => (entry.type === 'vocabulary'))
              .map(entry => (entry.parameters as unknown as ProfileEntryParametersVocabulary));
            this.vocabularies.forEach(vocabulary => {
              vocabularyEntryParams.forEach(entryParam => {
                if (entryParam.url === vocabulary.url) {
                  this.vocabulariesIdDictionary = {
                    ...this.vocabulariesIdDictionary,
                    ...this.mapVocabularyIds(vocabulary.data, entryParam)
                  };
                }
              });
            });
            resolve(true);
          }
          resolve(false);
        });
    });
  }

  private mapVocabularyIds(vocabulary: VocabData, entryParams: ProfileEntryParametersVocabulary) {
    const hasNarrower = (narrower: TopConcept[]) => {
      narrower.forEach((vocabularyEntry: TopConcept) => {
        this.idLabelDictionary[vocabularyEntry.id] = {
          labels: vocabularyEntry.prefLabel,
          notation: vocabularyEntry.notation || [],
          ...entryParams
        };
        if (vocabularyEntry.narrower) hasNarrower(vocabularyEntry.narrower);
      });
    };

    if (vocabulary.hasTopConcept) {
      vocabulary.hasTopConcept.forEach((topConcept: TopConcept) => {
        this.idLabelDictionary[topConcept.id] = {
          labels: topConcept.prefLabel, notation: topConcept.notation || [], ...entryParams
        };
        if (topConcept.narrower) hasNarrower(topConcept.narrower);
      });
    }
    return this.idLabelDictionary;
  }

  downloadMetadataReport(type: string, columns:string[], units:number[]): Observable<Blob> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('type', type);
    columns.forEach(column => { queryParams = queryParams.append('column', column); });
    units.forEach(unit => { queryParams = queryParams.append('id', unit); });
    return this.http.get(
      `${this.serverUrl}workspaces/${this.workspaceService.selectedWorkspaceId}/units/properties`, {
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        params: queryParams,
        responseType: 'blob'
      });
  }

  createMetadataReport(): Observable<boolean | UnitPropertiesDto[]> {
    // eslint-disable-next-line max-len
    return this.http.get<UnitPropertiesDto[]>(`${this.serverUrl}workspaces/${this.workspaceService.selectedWorkspaceId}/units/properties`)
      .pipe(
        catchError(() => of(false)),
        map(report => report)
      );
  }
}
