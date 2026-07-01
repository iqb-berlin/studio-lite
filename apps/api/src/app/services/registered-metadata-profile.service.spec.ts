import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ProfilesRegistryDto } from '@studio-lite-lib/api-dto';
import { RegisteredMetadataProfileService } from './registered-metadata-profile.service';
import { SettingService } from './setting.service';
import MetadataProfileRegistry from '../entities/metadata-profile-registry.entity';
import RegisteredMetadataProfile from '../entities/registered-metadata-profile.entity';
import { ProfilesRegistryNotAcceptableException } from '../exceptions/profiles-registry-not-acceptable.exception';

const mockHttpGet = <T>(httpService: DeepMocked<HttpService>, data: T) => {
  httpService.get.mockReturnValue(
    of({ data }) as unknown as ReturnType<HttpService['get']>
  );
};

describe('RegisteredMetadataProfileService', () => {
  let service: RegisteredMetadataProfileService;
  let metadataProfileRegistryRepository: DeepMocked<Repository<MetadataProfileRegistry>>;
  let registeredMetadataProfileRepository: DeepMocked<Repository<RegisteredMetadataProfile>>;
  let settingsService: DeepMocked<SettingService>;
  let httpService: DeepMocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisteredMetadataProfileService,
        {
          provide: getRepositoryToken(MetadataProfileRegistry),
          useValue: createMock<Repository<MetadataProfileRegistry>>()
        },
        {
          provide: getRepositoryToken(RegisteredMetadataProfile),
          useValue: createMock<Repository<RegisteredMetadataProfile>>()
        },
        {
          provide: SettingService,
          useValue: createMock<SettingService>()
        },
        {
          provide: HttpService,
          useValue: createMock<HttpService>()
        }
      ]
    }).compile();

    service = module.get<RegisteredMetadataProfileService>(RegisteredMetadataProfileService);
    metadataProfileRegistryRepository = module.get(getRepositoryToken(MetadataProfileRegistry));
    registeredMetadataProfileRepository = module.get(getRepositoryToken(RegisteredMetadataProfile));
    settingsService = module.get(SettingService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRegisteredMetadataProfiles', () => {
    it('should throw if csv is invalid', async () => {
      settingsService.findUnitProfilesRegistry.mockResolvedValue({ csvUrl: 'csv-url' } as ProfilesRegistryDto);
      metadataProfileRegistryRepository.findOneBy.mockResolvedValue(null);
      mockHttpGet(httpService, null as string | null);

      await expect(service.getRegisteredMetadataProfiles())
        .rejects.toThrow(ProfilesRegistryNotAcceptableException);
    });

    it('should return profiles from csv', async () => {
      const csvContent = 'Header\none,"two","http://profile1.url"';
      settingsService.findUnitProfilesRegistry.mockResolvedValue({ csvUrl: 'csv-url' } as ProfilesRegistryDto);
      // Mock registry found in DB
      metadataProfileRegistryRepository.findOneBy.mockResolvedValue({ csv: csvContent } as MetadataProfileRegistry);

      // Mock existing profile in DB for the URL extracted from CSV
      const existingProfile = new RegisteredMetadataProfile();
      existingProfile.url = 'http://profile1.url';
      registeredMetadataProfileRepository.findOneBy.mockResolvedValue(existingProfile);

      // Mock http get call for updateRegisteredMetadataProfiles (background)
      mockHttpGet(httpService, {} as RegisteredMetadataProfile);

      const result = await service.getRegisteredMetadataProfiles();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(existingProfile);
    });

    it('should fetch and register new profiles from csv', async () => {
      const csvContent = 'Header\none,"two","http://profile2.url"';
      settingsService.findUnitProfilesRegistry.mockResolvedValue({ csvUrl: 'csv-url' } as ProfilesRegistryDto);
      metadataProfileRegistryRepository.findOneBy.mockResolvedValue({ csv: csvContent } as MetadataProfileRegistry);

      registeredMetadataProfileRepository.findOneBy.mockResolvedValue(null);

      const newProfile = new RegisteredMetadataProfile();
      newProfile.id = 'p2';
      // Mock http get call for getting profile to register
      mockHttpGet(httpService, newProfile);

      registeredMetadataProfileRepository.create.mockReturnValue(newProfile);
      registeredMetadataProfileRepository.save.mockResolvedValue(newProfile);

      const result = await service.getRegisteredMetadataProfiles();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(newProfile);
      expect(registeredMetadataProfileRepository.save).toHaveBeenCalled();
    });

    it('extracts the url from the classic 3-column format despite a comma in a quoted title', async () => {
      const csvContent = [
        'title,description,url',
        '"IQB Mathematik, Aufgaben und Items","desc",https://example.org/p111/profile-config.json'
      ].join('\n');
      settingsService.findUnitProfilesRegistry.mockResolvedValue({ csvUrl: 'csv-url' } as ProfilesRegistryDto);
      metadataProfileRegistryRepository.findOneBy.mockResolvedValue({ csv: csvContent } as MetadataProfileRegistry);
      const existingProfile = new RegisteredMetadataProfile();
      existingProfile.url = 'https://example.org/p111/profile-config.json';
      registeredMetadataProfileRepository.findOneBy.mockResolvedValue(existingProfile);
      mockHttpGet(httpService, {} as RegisteredMetadataProfile);

      const result = await service.getRegisteredMetadataProfiles();

      expect(registeredMetadataProfileRepository.findOneBy)
        .toHaveBeenCalledWith({ url: 'https://example.org/p111/profile-config.json' });
      expect(result).toHaveLength(1);
    });

    it('extracts the url column from the newer 4-column (target) registry format', async () => {
      const csvContent = [
        'title,description,target,url',
        '"IQB Testprofil Aufgaben","Lange, Description","UNIT",https://w3id.org/iqb/p100/unit/'
      ].join('\n');
      settingsService.findUnitProfilesRegistry.mockResolvedValue({ csvUrl: 'csv-url' } as ProfilesRegistryDto);
      metadataProfileRegistryRepository.findOneBy.mockResolvedValue({ csv: csvContent } as MetadataProfileRegistry);
      const existingProfile = new RegisteredMetadataProfile();
      existingProfile.url = 'https://w3id.org/iqb/p100/unit/';
      registeredMetadataProfileRepository.findOneBy.mockResolvedValue(existingProfile);
      mockHttpGet(httpService, {} as RegisteredMetadataProfile);

      const result = await service.getRegisteredMetadataProfiles();

      expect(registeredMetadataProfileRepository.findOneBy)
        .toHaveBeenCalledWith({ url: 'https://w3id.org/iqb/p100/unit/' });
      expect(result).toHaveLength(1);
    });

    it('normalizes a direct profile (new format) so it can be stored without NOT NULL violations', async () => {
      const csvContent = [
        'title,description,target,url',
        '"t","d","UNIT",https://w3id.org/iqb/p100/unit/'
      ].join('\n');
      settingsService.findUnitProfilesRegistry.mockResolvedValue({ csvUrl: 'csv-url' } as ProfilesRegistryDto);
      metadataProfileRegistryRepository.findOneBy.mockResolvedValue({ csv: csvContent } as MetadataProfileRegistry);
      registeredMetadataProfileRepository.findOneBy.mockResolvedValue(null);

      // Newer registry serves a profile directly: label/target/groups, but no
      // creator/title/maintainer/profiles.
      const directProfile = {
        id: 'https://w3id.org/iqb/p100/unit/',
        label: [{ lang: 'de', value: 'Aufgabe' }],
        target: ['UNIT'],
        groups: []
      };
      mockHttpGet(httpService, directProfile as unknown as RegisteredMetadataProfile);
      registeredMetadataProfileRepository.create
        .mockImplementation(input => input as RegisteredMetadataProfile);
      registeredMetadataProfileRepository.save
        .mockImplementation(async input => input as RegisteredMetadataProfile);

      await service.getRegisteredMetadataProfiles();

      expect(registeredMetadataProfileRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'https://w3id.org/iqb/p100/unit/',
          url: 'https://w3id.org/iqb/p100/unit/',
          title: [{ lang: 'de', value: 'Aufgabe' }],
          creator: '',
          maintainer: '',
          profiles: []
        })
      );
    });
  });
});
