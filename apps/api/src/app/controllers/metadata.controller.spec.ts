import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MetadataVocabularyDto } from '@studio-lite-lib/api-dto';
import { MetadataController } from './metadata.controller';
import { MetadataProfileService } from '../services/metadata-profile.service';
import { RegisteredMetadataProfileService } from '../services/registered-metadata-profile.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';

describe('MetadataController', () => {
  let controller: MetadataController;
  let metadataProfileService: DeepMocked<MetadataProfileService>;
  let registeredMetadataProfileService: DeepMocked<RegisteredMetadataProfileService>;

  beforeEach(async () => {
    metadataProfileService = createMock<MetadataProfileService>();
    registeredMetadataProfileService = createMock<RegisteredMetadataProfileService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetadataController],
      providers: [
        { provide: MetadataProfileService, useValue: metadataProfileService },
        { provide: RegisteredMetadataProfileService, useValue: registeredMetadataProfileService },
        { provide: JwtAuthGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: createMock<AuthService>() }
      ]
    }).compile();

    controller = module.get<MetadataController>(MetadataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMetadataProfileByUrl', () => {
    it('should return metadata profile for a given URL', async () => {
      const mockProfile = { url: 'http://test' };
      metadataProfileService.getStoredMetadataProfile.mockResolvedValue(mockProfile as never);

      const result = await controller.getMetadataProfileByUrl('http://test');

      expect(result).toBe(mockProfile);
      expect(metadataProfileService.getStoredMetadataProfile).toHaveBeenCalledWith('http://test');
    });
  });

  describe('getMetadataVocabulariesForProfile', () => {
    it('should return vocabularies for a given profile URL', async () => {
      const mockVocabs = [{ id: 'v1' }] as MetadataVocabularyDto[];
      metadataProfileService.getProfileVocabularies.mockResolvedValue(mockVocabs);

      const result = await controller.getMetadataVocabulariesForProfile('http://test');

      expect(result).toBe(mockVocabs);
      expect(metadataProfileService.getProfileVocabularies).toHaveBeenCalledWith('http://test');
    });
  });

  describe('getRegistry', () => {
    it('should return registered metadata profiles', async () => {
      const mockRegistry = [{ id: 1 }];
      registeredMetadataProfileService.getRegisteredMetadataProfiles.mockResolvedValue(mockRegistry as never);

      const result = await controller.getRegistry();

      expect(result).toBe(mockRegistry);
      expect(registeredMetadataProfileService.getRegisteredMetadataProfiles).toHaveBeenCalled();
    });
  });
});
