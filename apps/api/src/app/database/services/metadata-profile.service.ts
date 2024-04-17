import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import {
  catchError, firstValueFrom, map, of
} from 'rxjs';
import { MetadataProfileDto } from '@studio-lite-lib/api-dto';
import MetadataProfile from '../entities/metadata-profile.entity';

@Injectable()
export class MetadataProfileService {
  constructor(
    @InjectRepository(MetadataProfile)
    private metadataProfileRepository: Repository<MetadataProfile>,
    private http: HttpService) {}

  async getMetadataProfile(url: string): Promise<MetadataProfileDto | null> {
    const profile = await firstValueFrom(
      this.http.get<MetadataProfileDto>(url)
        .pipe(
          catchError(() => of({ data: null })),
          map(result => result.data)
        )
    );
    if (profile) {
      await this.storeProfile(profile, url);
    } else {
      const storedProfile = await this.metadataProfileRepository
        .findOneBy({ id: url });
      if (storedProfile) {
        return storedProfile;
      }
    }
    return profile;
  }

  private async storeProfile(profile: MetadataProfileDto, url: string): Promise<void> {
    const metadataProfile = await this.metadataProfileRepository
      .findOneBy({ id: url });
    if (metadataProfile) {
      await this.metadataProfileRepository
        .save({ ...profile, modifiedAt: new Date() });
    } else {
      await this.createMetadataProfile(profile);
    }
  }

  private async createMetadataProfile(profile: MetadataProfileDto) {
    const newMetadataProfile = this.metadataProfileRepository
      .create({ ...profile, modifiedAt: new Date() });
    await this.metadataProfileRepository.save(newMetadataProfile);
  }
}
