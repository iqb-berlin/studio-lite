import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToTimePipe } from './to-time.pipe';

describe('ToTimePipe', () => {
  let pipe: ToTimePipe;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [TranslateService]
    });
    translateService = TestBed.inject(TranslateService);
    pipe = new ToTimePipe(translateService);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format single digit hour with leading zero', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Uhr');

    const result = pipe.transform(5);

    expect(result).toBe('05:00 Uhr');
    expect(translateService.instant).toHaveBeenCalledWith('hour');
  });

  it('should format double digit hour without adding extra zero', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Uhr');

    const result = pipe.transform(15);

    expect(result).toBe('15:00 Uhr');
    expect(translateService.instant).toHaveBeenCalledWith('hour');
  });

  it('should format zero hour correctly', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Uhr');

    const result = pipe.transform(0);

    expect(result).toBe('00:00 Uhr');
  });

  it('should format midnight hour (24) correctly', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Uhr');

    const result = pipe.transform(24);

    expect(result).toBe('24:00 Uhr');
  });

  it('should handle all hours from 0 to 23', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('hour');

    for (let hour = 0; hour < 24; hour++) {
      const result = pipe.transform(hour);
      const expectedHour = hour.toString().padStart(2, '0');
      expect(result).toBe(`${expectedHour}:00 hour`);
    }
  });

  it('should use translation service for hour text', () => {
    const instantSpy = jest.spyOn(translateService, 'instant').mockReturnValue('h');

    const result = pipe.transform(12);

    expect(instantSpy).toHaveBeenCalledWith('hour');
    expect(result).toBe('12:00 h');
  });

  it('should work with different translations', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('o\'clock');

    const result = pipe.transform(10);

    expect(result).toBe('10:00 o\'clock');
  });

  it('should call instant only once per transform', () => {
    const instantSpy = jest.spyOn(translateService, 'instant').mockReturnValue('Uhr');

    pipe.transform(8);

    expect(instantSpy).toHaveBeenCalledTimes(1);
  });

  it('should format three digit numbers correctly', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Uhr');

    const result = pipe.transform(100);

    expect(result).toBe('100:00 Uhr');
  });

  it('should handle edge case of very large numbers', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Uhr');

    const result = pipe.transform(9999);

    expect(result).toBe('9999:00 Uhr');
  });
});
