import { Injectable } from '@angular/core';
import { MDProfile } from '@iqb/metadata';
import { ProfileEntryParametersVocabulary } from '@iqb/metadata/md-profile-entry';

type TopConcept = {
  notation: string[];
  prefLabel: { de:string };
  narrower: TopConcept[];
  id:string
};

interface Profiles {
  itemProfiles?: MDProfile;
  unitProfiles?: MDProfile;
}

@Injectable({
  providedIn: 'root'
})

export class MetadataService {
  vocabulariesIdDictionary:any = {};
  vocabularies:any = [];
  profiles: Profiles = {};

  setProfile(profile: MDProfile, key: string): void {
    this.profiles[key as keyof Profiles] = profile;
  }

  getProfile(key: string): MDProfile | undefined {
    return this.profiles[key as keyof Profiles];
  }

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
    const promises = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const url of vocabularyURLs) {
      promises.push(this.fetchVocabulary(url));
    }
    const vocabularies = await Promise.all(promises);
    if (this.vocabularies.length) {
      this.vocabularies = [...this.vocabularies, ...vocabularies];
    } else {
      this.vocabularies = vocabularies;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const vocabulary of this.vocabularies) {
      this.vocabulariesIdDictionary = {
        ...this.vocabulariesIdDictionary,
        ...this.mapVocabularyIds(vocabulary.data)
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
    const response = await fetch(`${url}index.jsonld`);
    if (response.ok) {
      const vocab = await response.json();
      return { data: vocab, url };
    }
    return { data: {}, url };
  }
}
