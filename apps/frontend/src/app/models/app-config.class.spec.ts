import { DomSanitizer, SafeUrl, Title } from '@angular/platform-browser';
import { ConfigDto } from '@studio-lite-lib/api-dto';
import { AppConfig } from './app-config.class';

describe('AppConfig', () => {
  const createConfig = (overrides?: Partial<ConfigDto>): ConfigDto => ({
    appTitle: 'Test Studio',
    introHtml: '<p>Intro</p>',
    imprintHtml: '<p>Imprint</p>',
    emailSubject: 'Subject',
    emailBody: 'Body',
    globalWarningText: 'Warning',
    globalWarningExpiredDay: new Date('2030-01-01'),
    globalWarningExpiredHour: 1,
    hasUsers: false,
    ...overrides
  });

  it('should initialize with defaults when config is missing', () => {
    const titleServiceMock = {
      setTitle: jest.fn(),
      getTitle: jest.fn()
    } as unknown as jest.Mocked<Title>;

    const config = new AppConfig(titleServiceMock);

    expect(config.appTitle).toBe('IQB-Studio');
    expect(config.pageTitle).toBe('');
    expect(config.hideTitlesOnPage).toBe(false);
    expect(config.introHtml).toBeUndefined();
    expect(config.imprintHtml).toBeUndefined();
    expect(config.emailSubject).toBe('');
    expect(config.emailBody).toBe('');
    expect(config.globalWarningText()).toBe('');
    expect(config.hasUsers).toBe(true);
  });

  it('should use sanitizer for intro and imprint html', () => {
    const titleServiceMock = {
      setTitle: jest.fn(),
      getTitle: jest.fn()
    } as unknown as jest.Mocked<Title>;

    const safeHtml = 'safe-html' as unknown as SafeUrl;
    const sanitizerMock = {
      bypassSecurityTrustHtml: jest.fn().mockReturnValue(safeHtml)
    } as unknown as jest.Mocked<DomSanitizer>;

    const config = new AppConfig(titleServiceMock, createConfig(), sanitizerMock);

    expect(sanitizerMock.bypassSecurityTrustHtml).toHaveBeenCalledWith('<p>Intro</p>');
    expect(sanitizerMock.bypassSecurityTrustHtml).toHaveBeenCalledWith('<p>Imprint</p>');
    expect(config.introHtml).toBe(safeHtml);
    expect(config.imprintHtml).toBe(safeHtml);
    expect(config.hasUsers).toBe(false);
  });

  it('should return empty global warning text when expired', () => {
    const titleServiceMock = {
      setTitle: jest.fn(),
      getTitle: jest.fn()
    } as unknown as jest.Mocked<Title>;

    const expiredConfig = createConfig({
      globalWarningExpiredDay: new Date('2000-01-01'),
      globalWarningExpiredHour: 0
    });

    const config = new AppConfig(titleServiceMock, expiredConfig);

    expect(config.globalWarningText()).toBe('');
  });

  it('should keep global warning text when not expired', () => {
    const titleServiceMock = {
      setTitle: jest.fn(),
      getTitle: jest.fn()
    } as unknown as jest.Mocked<Title>;

    const futureConfig = createConfig({
      globalWarningExpiredDay: new Date('2099-01-01'),
      globalWarningExpiredHour: 0
    });

    const config = new AppConfig(titleServiceMock, futureConfig);

    expect(config.globalWarningText()).toBe('Warning');
  });

  it('should update title and hide flag when setting page title', () => {
    const titleServiceMock = {
      setTitle: jest.fn(),
      getTitle: jest.fn()
    } as unknown as jest.Mocked<Title>;

    const config = new AppConfig(titleServiceMock, createConfig());

    config.setPageTitle('Dashboard', true);

    expect(config.pageTitle).toBe('Dashboard');
    expect(config.hideTitlesOnPage).toBe(true);
    expect(titleServiceMock.setTitle).toHaveBeenCalledWith('Test Studio | Dashboard');
  });

  it('should compute expiration correctly', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60);
    const futureDate = new Date(Date.now() + 1000 * 60 * 60);

    expect(AppConfig.isExpired(pastDate, 0)).toBe(true);
    expect(AppConfig.isExpired(futureDate, 0)).toBe(false);
    expect(AppConfig.isExpired(undefined, 0)).toBe(false);
  });
});
