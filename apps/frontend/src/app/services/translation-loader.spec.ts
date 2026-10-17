import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import * as applicationTranslations from '../../assets/i18n/de.json';
import { createTranslateLoader } from './translation-loader';

describe('shared component translations in Studio', () => {
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (client: HttpClient) => createTranslateLoader(client),
          deps: [HttpClient]
        }
      })],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    translate = TestBed.inject(TranslateService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses component defaults without copying Codebook labels into the application file', async () => {
    expect(applicationTranslations).not.toHaveProperty('codebook');
    const loaded = firstValueFrom(translate.use('de'));
    http.expectOne(request => /^\.\/assets\/i18n\/de\.json\?v=\d+$/.test(request.url))
      .flush(applicationTranslations);
    await loaded;
    expect(translate.instant('codebook.export')).toBe('Exportieren');
    expect(translate.instant('codebook.dialogs.cancel')).toBe('Abbrechen');
    expect(translate.instant('codebook.coding.selected-units', { count: 2 })).toBe('2 Aufgaben ausgewählt');
  });

  it('preserves application-only labels and deliberate overrides', async () => {
    const loaded = firstValueFrom(translate.use('de'));
    http.expectOne(request => request.url.startsWith('./assets/i18n/de.json?'))
      .flush({ applicationOnly: 'Eigener Text', codebook: { export: 'Herunterladen' } });
    await loaded;
    expect(translate.instant('applicationOnly')).toBe('Eigener Text');
    expect(translate.instant('codebook.export')).toBe('Herunterladen');
    expect(translate.instant('codebook.dialogs.cancel')).toBe('Abbrechen');
  });

  it('selects the German component defaults for a regional locale', async () => {
    const loaded = firstValueFrom(translate.use('de-AT'));
    http.expectOne(request => request.url.startsWith('./assets/i18n/de-AT.json?')).flush({});
    await loaded;
    expect(translate.instant('codebook.export')).toBe('Exportieren');
  });
});
