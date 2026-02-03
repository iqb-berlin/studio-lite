import { TestBed } from '@angular/core/testing';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateParser, TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { PaginatorIntlService } from './paginator-intl.service';

describe('PaginatorIntlService', () => {
  let service: PaginatorIntlService;
  let translateService: jest.Mocked<TranslateService>;
  let translateParser: jest.Mocked<TranslateParser>;
  let langChangeSubject: Subject<unknown>;

  beforeEach(() => {
    langChangeSubject = new Subject();

    const mockTranslations = {
      'paginator.items-per-page': 'Items per page',
      'paginator.next-page': 'Next page',
      'paginator.previous-page': 'Previous page',
      'paginator.range': '{{start}} - {{end}} of {{total}}'
    };

    const translateServiceMock = {
      get: jest.fn().mockReturnValue(of(mockTranslations)),
      onLangChange: langChangeSubject.asObservable()
    };

    const translateParserMock = {
      interpolate: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        PaginatorIntlService,
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: TranslateParser, useValue: translateParserMock }
      ]
    });

    service = TestBed.inject(PaginatorIntlService);
    translateService = TestBed.inject(TranslateService) as jest.Mocked<TranslateService>;
    translateParser = TestBed.inject(TranslateParser) as jest.Mocked<TranslateParser>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should extend MatPaginatorIntl', () => {
    expect(service instanceof MatPaginatorIntl).toBe(true);
  });

  describe('initialization', () => {
    it('should call getTranslations on init', () => {
      const mockTranslations = {
        'paginator.items-per-page': 'Items per page',
        'paginator.next-page': 'Next page',
        'paginator.previous-page': 'Previous page',
        'paginator.range': '{{start}} - {{end}} of {{total}}'
      };

      translateService.get.mockReturnValue(of(mockTranslations));

      service.init();

      expect(translateService.get).toHaveBeenCalledWith([
        'paginator.items-per-page',
        'paginator.next-page',
        'paginator.previous-page',
        'paginator.range'
      ]);
    });

    it('should set translation labels correctly', done => {
      const mockTranslations = {
        'paginator.items-per-page': 'Elemente pro Seite',
        'paginator.next-page': 'Nächste Seite',
        'paginator.previous-page': 'Vorherige Seite',
        'paginator.range': '{{start}} - {{end}} von {{total}}'
      };

      translateService.get.mockReturnValue(of(mockTranslations));

      service.init();

      setTimeout(() => {
        expect(service.itemsPerPageLabel).toBe('Elemente pro Seite');
        expect(service.nextPageLabel).toBe('Nächste Seite');
        expect(service.previousPageLabel).toBe('Vorherige Seite');
        done();
      }, 50);
    });

    it('should subscribe to language changes', done => {
      const updatedTranslations = {
        'paginator.items-per-page': 'Elemente pro Seite',
        'paginator.next-page': 'Nächste Seite',
        'paginator.previous-page': 'Vorherige Seite',
        'paginator.range': '{{start}} - {{end}} von {{total}}'
      };

      // Reset mock after constructor call
      translateService.get.mockClear();
      translateService.get.mockReturnValue(of(updatedTranslations));

      langChangeSubject.next({});

      setTimeout(() => {
        expect(translateService.get).toHaveBeenCalledTimes(1);
        expect(service.itemsPerPageLabel).toBe('Elemente pro Seite');
        done();
      }, 50);
    });
  });

  describe('getTranslations', () => {
    it('should emit changes notification', done => {
      const mockTranslations = {
        'paginator.items-per-page': 'Items',
        'paginator.next-page': 'Next',
        'paginator.previous-page': 'Previous',
        'paginator.range': '{{start}}-{{end}}/{{total}}'
      };

      translateService.get.mockReturnValue(of(mockTranslations));

      service.changes.subscribe(() => {
        done();
      });

      service.getTranslations();
    });
  });

  describe('getRangeLabel', () => {
    beforeEach(() => {
      const mockTranslations = {
        'paginator.items-per-page': 'Items per page',
        'paginator.next-page': 'Next page',
        'paginator.previous-page': 'Previous page',
        'paginator.range': '{{start}} - {{end}} of {{total}}'
      };

      translateService.get.mockReturnValue(of(mockTranslations));
      service.init();
    });

    it('should return interpolated range label for first page', () => {
      translateParser.interpolate.mockReturnValue('1 - 10 of 100');

      const result = service.getRangeLabel(0, 10, 100);

      expect(translateParser.interpolate).toHaveBeenCalledWith(
        '{{start}} - {{end}} of {{total}}',
        { start: 1, end: 10, total: 100 }
      );
      expect(result).toBe('1 - 10 of 100');
    });

    it('should return interpolated range label for middle page', () => {
      translateParser.interpolate.mockReturnValue('11 - 20 of 100');

      const result = service.getRangeLabel(1, 10, 100);

      expect(translateParser.interpolate).toHaveBeenCalledWith(
        '{{start}} - {{end}} of {{total}}',
        { start: 11, end: 20, total: 100 }
      );
      expect(result).toBe('11 - 20 of 100');
    });

    it('should return interpolated range label for last partial page', () => {
      translateParser.interpolate.mockReturnValue('91 - 95 of 95');

      const result = service.getRangeLabel(9, 10, 95);

      expect(translateParser.interpolate).toHaveBeenCalledWith(
        '{{start}} - {{end}} of {{total}}',
        { start: 91, end: 95, total: 95 }
      );
      expect(result).toBe('91 - 95 of 95');
    });

    it('should handle empty list', () => {
      translateParser.interpolate.mockReturnValue('1 - 10 of 0');

      const result = service.getRangeLabel(0, 10, 0);

      expect(translateParser.interpolate).toHaveBeenCalledWith(
        '{{start}} - {{end}} of {{total}}',
        { start: 1, end: 10, total: 0 }
      );
      expect(result).toBe('1 - 10 of 0');
    });

    it('should handle single item', () => {
      translateParser.interpolate.mockReturnValue('1 - 1 of 1');

      const result = service.getRangeLabel(0, 10, 1);

      expect(translateParser.interpolate).toHaveBeenCalledWith(
        '{{start}} - {{end}} of {{total}}',
        { start: 1, end: 1, total: 1 }
      );
      expect(result).toBe('1 - 1 of 1');
    });

    it('should handle page beyond total length', () => {
      translateParser.interpolate.mockReturnValue('101 - 110 of 100');

      const result = service.getRangeLabel(10, 10, 100);

      expect(translateParser.interpolate).toHaveBeenCalledWith(
        '{{start}} - {{end}} of {{total}}',
        { start: 101, end: 110, total: 100 }
      );
      expect(result).toBe('101 - 110 of 100');
    });

    it('should return empty string when interpolate returns null', () => {
      translateParser.interpolate.mockReturnValue(null as unknown as string);

      const result = service.getRangeLabel(0, 10, 100);

      expect(result).toBe('');
    });

    it('should return empty string when interpolate returns undefined', () => {
      translateParser.interpolate.mockReturnValue(undefined as unknown as string);

      const result = service.getRangeLabel(0, 10, 100);

      expect(result).toBe('');
    });

    it('should start counting from 1 not 0', () => {
      translateParser.interpolate.mockReturnValue('1 - 5 of 10');

      service.getRangeLabel(0, 5, 10);

      expect(translateParser.interpolate).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ start: 1 })
      );
    });
  });
});
