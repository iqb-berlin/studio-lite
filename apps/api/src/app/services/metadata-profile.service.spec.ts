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
