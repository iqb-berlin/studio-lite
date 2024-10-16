import { Inject, Injectable } from '@angular/core';
import { MDProfile, MDProfileGroup } from '@iqb/metadata';
import { ProfileEntryParametersVocabulary } from '@iqb/metadata/md-profile-entry';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { TopConcept, UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { BackendService } from './backend.service';
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
              private backendService: BackendService,
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
            if (this.vocabularies.length) {
              this.vocabularies = [...this.vocabularies, ...vocabularies];
            } else {
              this.vocabularies = vocabularies;
            }
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

  downloadItemsMetadataReport(columns:string[]): Observable<Blob> {
    const joinedString = columns.join(',')
      .replace(/key/g, 'Aufgabe')
      .replace(/description/g, 'Beschreibung')
      .replace(/variableId/g, 'Variable')
      .replace(/weighting/g, 'Wichtung')
      .replace(/id/g, 'Item-Id');
    return this.http.get(
      // eslint-disable-next-line max-len
      `${this.serverUrl}download/xlsx/unit-metadata-items/${this.workspaceService.selectedWorkspaceId}/${encodeURIComponent(joinedString)}`, {
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        responseType: 'blob'
      });
  }

  downloadUnitsMetadataReport(columns:string[]): Observable<Blob> {
    const joinedString = columns.join(',').replace(/key/g, 'Aufgabe');
    return this.http.get(
      // eslint-disable-next-line max-len
      `${this.serverUrl}download/xlsx/unit-metadata/${this.workspaceService.selectedWorkspaceId}/${encodeURIComponent(joinedString)}`, {
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        responseType: 'blob'
      });
  }

  createMetadataReport(): Observable<boolean | UnitMetadataDto[]> {
    return this.http
      .get<UnitMetadataDto[]>(`${this.serverUrl}workspace/${this.workspaceService.selectedWorkspaceId}/units/metadata`)
      .pipe(
        catchError(() => of(false)),
        map(report => report)
      );
  }
}
