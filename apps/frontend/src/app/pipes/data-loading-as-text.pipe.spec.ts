import { inject, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataLoadingAsTextPipe } from './data-loading-as-text.pipe';

describe('DataLoadingAsTextPipe', () => {
  beforeEach(() => {
    TestBed
      .configureTestingModule({
        declarations: [DataLoadingAsTextPipe],
        imports: [
          TranslateModule.forRoot()
        ]
      });
  });

  it('create an instance', inject([TranslateService], (translateService: TranslateService) => {
    const pipe = new DataLoadingAsTextPipe(translateService);
    expect(pipe).toBeTruthy();
  }));
});
