import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataLoadingAsTextPipe } from './data-loading-as-text.pipe';

describe('DataLoadingAsTextPipe', () => {
  let pipe: DataLoadingAsTextPipe;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed
      .configureTestingModule({
        imports: [
          TranslateModule.forRoot()
        ]
      });
    translateService = TestBed.inject(TranslateService);
    pipe = new DataLoadingAsTextPipe(translateService);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return percentage when value is a number <= 100', () => {
    expect(pipe.transform(0)).toBe('0 %');
    expect(pipe.transform(50)).toBe('50 %');
    expect(pipe.transform(100)).toBe('100 %');
  });

  it('should return kilobytes when value is between 100 and 8000', () => {
    expect(pipe.transform(101)).toBe('0.1 kB');
    expect(pipe.transform(1024)).toBe('1.0 kB');
    expect(pipe.transform(5120)).toBe('5.0 kB');
    expect(pipe.transform(7999)).toBe('7.8 kB');
  });

  it('should return megabytes when value is >= 8000', () => {
    expect(pipe.transform(8000)).toBe('0.0 MB');
    expect(pipe.transform(1048576)).toBe('1.0 MB');
    expect(pipe.transform(5242880)).toBe('5.0 MB');
  });

  it('should return translated wait message when value is boolean', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Please wait...');
    const result = pipe.transform(true);
    expect(translateService.instant).toHaveBeenCalledWith('application.wait-message');
    expect(result).toBe('Please wait...');
  });

  it('should handle boolean false value', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Please wait...');
    const result = pipe.transform(false);
    expect(translateService.instant).toHaveBeenCalledWith('application.wait-message');
    expect(result).toBe('Please wait...');
  });
});
