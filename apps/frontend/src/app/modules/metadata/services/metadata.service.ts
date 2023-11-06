import { Injectable } from '@angular/core';
import { MDProfile } from '@iqb/metadata';
import { ProfileEntryParametersVocabulary } from '@iqb/metadata/md-profile-entry';

type TopConcept = {
  notation: string[];
  prefLabel: { de:string };
  narrower: TopConcept[];
  id:string
};
@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  vocabulariesIdDictionary:any = {};
  vocabularies:any = [];
  async getProfileVocabularies(profile:MDProfile) {
    const vocabularyURLs = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const group of profile.groups) {
      // eslint-disable-next-line no-restricted-syntax
      for (const entry of group.entries) {
        const entryParams = entry.parameters as ProfileEntryParametersVocabulary;
        if (entry.type === 'vocabulary') vocabularyURLs.push(entryParams.url);
      }
    }
    this.vocabularies = await Promise.all(vocabularyURLs
      .map(async url => ({
        url: url,
        data: await this.fetchVocabulary(url)
      })));
    // eslint-disable-next-line no-restricted-syntax
    for (const vocabulary of this.vocabularies) {
      this.vocabulariesIdDictionary = {
        ...this.vocabulariesIdDictionary,
        ...this.mapVocabularyIds(vocabulary.data.data)
      };
    }
    return this.vocabulariesIdDictionary;
  }

  // eslint-disable-next-line class-methods-use-this
  mapVocabularyIds(vocabulary:any) {
    const idLabelDictionary:any = {};
    const hasNarrower = (narrower:TopConcept[]) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const vocabularyEntry of narrower) {
        idLabelDictionary[vocabularyEntry.id] = {
          labels: vocabularyEntry.prefLabel,
          notation: vocabularyEntry.notation || ''
        };
        if (vocabularyEntry.narrower) hasNarrower(vocabularyEntry.narrower);
      }
    };

    if (vocabulary.hasTopConcept) {
      // eslint-disable-next-line no-restricted-syntax
      for (const topConcept of vocabulary.hasTopConcept) {
        idLabelDictionary[topConcept.id] = { labels: topConcept.prefLabel, notation: topConcept.notation || '' };
        if (topConcept.narrower) hasNarrower(topConcept.narrower);
      }
    }
    return idLabelDictionary;
  }

  // eslint-disable-next-line class-methods-use-this
  async fetchVocabulary(url:string) : Promise<any> {
    const response = await fetch(`${url}index.json`);
    if (response.ok) {
      const vocab = await response.json();
      return { data: vocab };
    }
    return { data: {} };
  }
}
