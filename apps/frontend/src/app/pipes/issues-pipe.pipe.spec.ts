import { inject, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserIssuesPipe } from './issues-pipe.pipe';

describe('UserIssuesPipe', () => {
  beforeEach(() => {
    TestBed
      .configureTestingModule({
        imports: [
          TranslateModule.forRoot()
        ]
      });
  });

  it('create an instance', inject([TranslateService], (translateService: TranslateService) => {
    const pipe = new UserIssuesPipe(translateService);
    expect(pipe).toBeTruthy();
  }));
});
