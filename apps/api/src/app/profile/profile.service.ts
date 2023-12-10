import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ProfileService {
  private vocabsPath = './profiles/vocabs';
  private profilesPath = './profiles';
  private baseUrlVocabs = 'https://w3id.org/iqb/';
  private baseUrlProfile = 'https://raw.githubusercontent.com/iqb-vocabs';

  async saveVocabs(vocabs): Promise<boolean> {
    vocabs.forEach((vocab: any) => {
      const url = vocab.url.replace(this.baseUrlVocabs, '').replace(/\//g, '');
      if (Object.keys(vocab.data).length !== 0) {
        const content = JSON.stringify(vocab.data);
        fs.writeFileSync(`${this.vocabsPath}/${url}.json`, content);
      }
    });
    return true;
  }

  async getVocab(id:string): Promise<any> {
    const filenames = await fs.promises.readdir(this.vocabsPath);
    let searchedFile:string;
    filenames.forEach(filename => {
      if (filename === `${id}.json`) {
        searchedFile = filename;
      }
    });
    if (searchedFile) {
      const data = fs.readFileSync(`${this.vocabsPath}/${searchedFile}`, 'utf8');
      return JSON.parse(data);
    }
    return {};
  }

  async saveProfile(profile): Promise<any> {
    const url = profile.id.replace(this.baseUrlProfile, '').replace(/\//g, '');
    if (Object.keys(profile).length !== 0) {
      const content = JSON.stringify(profile);
      fs.writeFileSync(`${this.profilesPath}/${url}`, content);
    }
  }

  async getProfile(id:string): Promise<any> {
    const filenames = await fs.promises.readdir(this.profilesPath);
    let searchedFile:string;
    filenames.forEach(filename => {
      if (filename === `${id}.json`) {
        searchedFile = filename;
      }
    });
    if (searchedFile) {
      const data = fs.readFileSync(`${this.profilesPath}/${searchedFile}`, 'utf8');
      return JSON.parse(data);
    }
    return {};
  }
}
