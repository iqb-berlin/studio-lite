import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { CopyReviewLinkButtonComponent } from './copy-review-link-button.component';

describe('CopyReviewLinkButtonComponent', () => {
  let component: CopyReviewLinkButtonComponent;
  let fixture: ComponentFixture<CopyReviewLinkButtonComponent>;

  let clipboard: { copy: jest.Mock<boolean, [string]> };
  let snackBar: { open: jest.Mock<void, [string, string, { duration: number }]> };
  let translateService: TranslateService;

  beforeEach(async () => {
    clipboard = { copy: jest.fn<boolean, [string]>(() => true) };
    snackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        CopyReviewLinkButtonComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        { provide: Clipboard, useValue: clipboard },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => (
      Array.isArray(key) ? key.join(',') : key
    ));

    fixture = TestBed.createComponent(CopyReviewLinkButtonComponent);
    component = fixture.componentInstance;
    component.link = 'review/abc';
    component.unitCount = 1;
    component.passwordLength = 4;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('copies the review link and shows a snackbar', () => {
    component.copyLinkToClipboard();

    expect(clipboard.copy).toHaveBeenCalledWith(`${window.location.origin}/#/${component.link}`);
    expect(snackBar.open).toHaveBeenCalledWith('workspace.link-copied', '', { duration: 1000 });
  });

  it('disables the button when prerequisites are not met', () => {
    component.unitCount = 0;
    component.passwordLength = 3;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
