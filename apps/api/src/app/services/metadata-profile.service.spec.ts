import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { MetadataProfileDto, MetadataVocabularyDto } from '@studio-lite-lib/api-dto';
import MetadataProfile from '../entities/metadata-profile.entity';
import { MetadataProfileService } from './metadata-profile.service';
import { MetadataVocabularyService } from './metadata-vocabulary.service';

const mockHttpGet = <T>(httpService: DeepMocked<HttpService>, data: T) => {
  httpService.get.mockReturnValue(
    of({ data }) as unknown as ReturnType<HttpService['get']>
  );
};

describe('MetadataProfileService', () => {
  let service: MetadataProfileService;
  let metadataProfileRepository: DeepMocked<Repository<MetadataProfile>>;
  let metadataVocabularyService: DeepMocked<MetadataVocabularyService>;
  let httpService: DeepMocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetadataProfileService,
        {
          provide: getRepositoryToken(MetadataProfile),
          useValue: createMock<Repository<MetadataProfile>>()
        },
        {
          provide: MetadataVocabularyService,
          useValue: createMock<MetadataVocabularyService>()
        },
        {
          provide: HttpService,
          useValue: createMock<HttpService>()
        }
      ]
    }).compile();

    service = module.get<MetadataProfileService>(MetadataProfileService);
    metadataProfileRepository = module.get(getRepositoryToken(MetadataProfile));
    metadataVocabularyService = module.get(MetadataVocabularyService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStoredMetadataProfileFromDb', () => {
    it('returns the stored profile from the DB without a background network fetch', async () => {
      const profile = new MetadataProfile();
      metadataProfileRepository.findOneBy.mockResolvedValue(profile);

      const result = await service.getStoredMetadataProfileFromDb('url');

      expect(result).toBe(profile);
      expect(metadataProfileRepository.findOneBy).toHaveBeenCalledWith({ id: 'url' });
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('returns null when the profile is not stored', async () => {
      metadataProfileRepository.findOneBy.mockResolvedValue(null);
      await expect(service.getStoredMetadataProfileFromDb('missing')).resolves.toBeNull();
      expect(httpService.get).not.toHaveBeenCalled();
    });
  });

  describe('getStoredMetadataProfile', () => {
    it('should return stored profile if found', async () => {
      const profile = new MetadataProfile();
      metadataProfileRepository.findOneBy.mockResolvedValue(profile);
      // Mock http.get just in case, because getMetadataProfile is called in background
      mockHttpGet(httpService, {} as MetadataProfileDto);

      const result = await service.getStoredMetadataProfile('url');
      expect(result).toBe(profile);
      expect(metadataProfileRepository.findOneBy).toHaveBeenCalledWith({ id: 'url' });
    });

    it('should fetch profile if not found', async () => {
      metadataProfileRepository.findOneBy.mockResolvedValue(null);
      const profileDto = { id: 'url' } as MetadataProfileDto;
      mockHttpGet(httpService, profileDto);
      metadataProfileRepository.create.mockReturnValue(new MetadataProfile());
      metadataProfileRepository.save.mockResolvedValue(new MetadataProfile());

      const result = await service.getStoredMetadataProfile('url');
      expect(result).toEqual(profileDto);
    });

    it('caches and returns a fetched profile under the requested url, not its self-declared id', async () => {
      // real iqb-vocabs profiles still declare the github spelling as their id
      // while the app references them by w3id (#1570)
      const w3id = 'https://w3id.org/iqb/p11/unit/';
      const github = 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json';
      metadataProfileRepository.findOneBy.mockResolvedValue(null);
      mockHttpGet(httpService, { id: github, groups: [], label: [] } as unknown as MetadataProfileDto);
      metadataProfileRepository.create.mockImplementation(
        profile => profile as MetadataProfile
      );

      const result = await service.getStoredMetadataProfile(w3id);

      expect((result as MetadataProfileDto).id).toBe(w3id);
      expect(metadataProfileRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ id: w3id })
      );
    });

    it('refreshes the row keyed by the requested url instead of inserting under the self-declared id',
      async () => {
        const w3id = 'https://w3id.org/iqb/p11/unit/';
        const github = 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json';
        const storedProfile = new MetadataProfile();
        storedProfile.id = w3id;
        metadataProfileRepository.findOneBy.mockResolvedValue(storedProfile);
        mockHttpGet(httpService, { id: github, groups: [], label: [] } as unknown as MetadataProfileDto);

        await service.getStoredMetadataProfile(w3id);
        // let the fire-and-forget background refresh finish
        await new Promise(process.nextTick);

        expect(metadataProfileRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({ id: w3id })
        );
        expect(metadataProfileRepository.create).not.toHaveBeenCalled();
      });
  });

  describe('getProfileVocabularies', () => {
    it('should return vocabularies', async () => {
      const profileDto = {
        groups: [
          {
            entries: [
              { type: 'vocabulary', parameters: { url: 'vocab-url' } }
            ]
          }
        ]
      } as unknown as MetadataProfileDto; // casting as partial implementation

      // Spy on public method to return mocked profile
      jest.spyOn(service, 'getStoredMetadataProfile').mockResolvedValue(profileDto);

      metadataVocabularyService.getStoredMetadataVocabularyById
        .mockResolvedValue({ id: 'vocab-url' } as MetadataVocabularyDto);

      const result = await service.getProfileVocabularies('url');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('vocab-url');
    });
  });
});
