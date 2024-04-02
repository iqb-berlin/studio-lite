import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ProfileService {
  private vocabsPath = './profiles/vocabs';
  private profilesPath = './profiles';
  private baseUrlVocabs = 'https://w3id.org/iqb/';
  private baseUrlProfile = 'https://raw.githubusercontent.com/iqb-vocabs';

  async saveVocabs(vocabs): Promise<boolean> {
    vocabs.forEach(vocab => {
      const url = vocab.url.replace(this.baseUrlVocabs, '').replace(/\//g, '');
      if (Object.keys(vocab.data).length !== 0) {
        const content = JSON.stringify(vocab.data);
        if (!fs.existsSync(this.vocabsPath)) {
          fs.mkdirSync(this.vocabsPath);
        }
        fs.writeFileSync(`${this.vocabsPath}/${url}.json`, content);
      }
    });
    return true;
  }

  async getVocab(id:string): Promise<unknown> {
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

  async saveProfile(profile): Promise<void> {
    const url = profile.id.replace(this.baseUrlProfile, '').replace(/\//g, '');
    if (Object.keys(profile).length !== 0) {
      const content = JSON.stringify(profile);
      if (!fs.existsSync(this.profilesPath)) {
        fs.mkdirSync(this.profilesPath);
      }
      fs.writeFileSync(`${this.profilesPath}/${url}`, content);
    }
  }

  async getProfile(id:string): Promise<unknown> {
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
