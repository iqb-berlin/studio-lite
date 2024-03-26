import { Inject, Injectable } from '@angular/core';
import { MDProfile, MDProfileEntry, MDProfileGroup } from '@iqb/metadata';
import { ProfileEntryParametersVocabulary } from '@iqb/metadata/md-profile-entry';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BackendService } from './backend.service';
import { WorkspaceService } from '../../workspace/services/workspace.service';

type TopConcept = {
  notation: string[];
  prefLabel: { de: string };
  narrower: TopConcept[];
  id: string
};

@Injectable({
  providedIn: 'root'
})

export class MetadataService {
  idLabelDictionary: any = {};
  vocabulariesIdDictionary: any = {};
  vocabularies: any = [];
  unitProfileColumns:MDProfileGroup[] = [];
  itemProfileColumns:MDProfileGroup = {} as MDProfileGroup;

  constructor(@Inject('SERVER_URL') private readonly serverUrl: string,
              private backendService: BackendService,
              private workspaceService: WorkspaceService,
              private http: HttpClient) {
  }

  async getProfileVocabularies(profile: MDProfile) {
    const vocabularyURLs:any = [];
    profile.groups.forEach(group => {
      group.entries.forEach(entry => {
        const entryParams = entry.parameters as ProfileEntryParametersVocabulary;
        if (entry.type === 'vocabulary') vocabularyURLs.push(entryParams);
      });
    });
    const promises:any = [];
    vocabularyURLs.forEach((entryParams:any) => {
      promises.push(this.fetchVocabulary(entryParams.url));
    });
    const vocabularies = await Promise.all(promises);
    this.backendService.saveVocabs(vocabularies).subscribe(() => {});
    if (this.vocabularies.length) {
      this.vocabularies = [...this.vocabularies, ...vocabularies];
    } else {
      this.vocabularies = vocabularies;
    }
    this.vocabularies.forEach((vocabulary:any) => {
      vocabularyURLs.forEach((entryParams:any) => {
        if (entryParams.url === vocabulary.url) {
          this.vocabulariesIdDictionary = {
            ...this.vocabulariesIdDictionary,
            ...this.mapVocabularyIds(vocabulary.data, entryParams)
          };
        }
      });
    });
    return this.vocabulariesIdDictionary;
  }

  mapVocabularyIds(vocabulary: any, entryParams: MDProfileEntry) {
    const hasNarrower = (narrower: TopConcept[]) => {
      narrower.forEach((vocabularyEntry: TopConcept) => {
        this.idLabelDictionary[vocabularyEntry.id] = {
          labels: vocabularyEntry.prefLabel,
          notation: vocabularyEntry.notation || '',
          ...entryParams
        };
        if (vocabularyEntry.narrower) hasNarrower(vocabularyEntry.narrower);
      });
    };

    if (vocabulary.hasTopConcept) {
      vocabulary.hasTopConcept.forEach((topConcept: TopConcept) => {
        this.idLabelDictionary[topConcept.id] = {
          labels: topConcept.prefLabel, notation: topConcept.notation || '', ...entryParams
        };
        if (topConcept.narrower) hasNarrower(topConcept.narrower);
      });
    }
    return this.idLabelDictionary;
  }

  async fetchVocabulary(url: string): Promise<any> {
    try {
      const response = await fetch(`${url}index.jsonld`);
      if (response.ok) {
        const vocab = await response.json();
        return { data: vocab, url };
      }
      return await new Promise(resolve => {
        this.backendService.getVocab(url)
          .subscribe((vocab: any) => resolve({ data: vocab, url }));
      });
    } catch {
      return { data: {}, url };
    }
  }

  downloadItemsMetadataReport(columns:string[]): Observable<Blob> {
    const joinedString = columns.join(',');
    return this.http.get(
      // eslint-disable-next-line max-len
      `${this.serverUrl}download/xlsx/unit-metadata-items/${this.workspaceService.selectedWorkspaceId}/${encodeURIComponent(joinedString)}}`, {
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        responseType: 'blob'
      });
  }

  downloadUnitsMetadataReport(columns:string[]): Observable<Blob> {
    const joinedString = columns.join(',');
    return this.http.get(
      // eslint-disable-next-line max-len
      `${this.serverUrl}download/xlsx/unit-metadata/${this.workspaceService.selectedWorkspaceId}/${encodeURIComponent(joinedString)}`, {
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        responseType: 'blob'
      });
  }

  createMetadataReport(): Observable<boolean | unknown> {
    return this.http.get(
      `${this.serverUrl}workspace/${this.workspaceService.selectedWorkspaceId}/units/metadata`)
      .pipe(
        catchError(() => of(false)),
        map(report => report)
      );
  }
}
