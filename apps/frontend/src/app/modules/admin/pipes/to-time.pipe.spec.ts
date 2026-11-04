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
});
