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

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
