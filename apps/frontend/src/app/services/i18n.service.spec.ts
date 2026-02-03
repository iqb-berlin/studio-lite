import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;
  let translateService: jest.Mocked<TranslateService>;

  beforeEach(() => {
    const translateServiceMock = {
      use: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        I18nService,
        { provide: TranslateService, useValue: translateServiceMock }
      ]
    });

    service = TestBed.inject(I18nService);
    translateService = TestBed.inject(TranslateService) as jest.Mocked<TranslateService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('default values', () => {
    it('should have correct default fileDateFormat', () => {
      expect(service.fileDateFormat).toBe('yyyy-MM-dd');
    });

    it('should have correct default fullLocale', () => {
      expect(service.fullLocale).toBe('de-DE');
    });

    it('should have correct default language', () => {
      expect(service.language).toBe('de');
    });

    it('should have correct default dateTimeFormat', () => {
      expect(service.dateTimeFormat).toBe('dd.MM.yyyy HH:mm');
    });

    it('should have correct default dateFormat', () => {
      expect(service.dateFormat).toBe('dd.MM.yyyy');
    });
  });

  describe('setLocale', () => {
    it('should set timeZone from browser', () => {
      service.setLocale();
      expect(service.timeZone).toBeDefined();
      expect(typeof service.timeZone).toBe('string');
    });

    it('should call translateService.use with correct language', () => {
      service.setLocale();
      expect(translateService.use).toHaveBeenCalledWith('de');
    });

    it('should call translateService.use exactly once', () => {
      service.setLocale();
      expect(translateService.use).toHaveBeenCalledTimes(1);
    });
  });
});
