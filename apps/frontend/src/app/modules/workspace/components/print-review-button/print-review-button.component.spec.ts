import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import { PrintReviewButtonComponent } from './print-review-button.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

@Component({ selector: 'studio-lite-wrapped-icon', template: '', standalone: true })
class MockWrappedIconComponent {
  @Input() icon!: string;
}

describe('PrintReviewButtonComponent', () => {
  let component: PrintReviewButtonComponent;
  let fixture: ComponentFixture<PrintReviewButtonComponent>;

  const mockDialog = {
    open: jest.fn()
  };

  const mockRouter = {
    createUrlTree: jest.fn(),
    serializeUrl: jest.fn().mockReturnValue('/print?params')
  };

  const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintReviewButtonComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter }
      ]
    })
      .overrideComponent(PrintReviewButtonComponent, {
        remove: { imports: [WrappedIconComponent] },
        add: { imports: [MockWrappedIconComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PrintReviewButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open dialog and print view on close with result', () => {
    const dialogRef = { afterClosed: () => of([{ key: 'opt1', value: true }]) };
    mockDialog.open.mockReturnValue(dialogRef);

    component.showPrintOptions();

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockRouter.createUrlTree).toHaveBeenCalled();
    expect(windowOpenSpy).toHaveBeenCalledWith('#/print?params', '_blank');
  });

  it('should not open print view if dialog cancelled', () => {
    const dialogRef = { afterClosed: () => of(null) };
    mockDialog.open.mockReturnValue(dialogRef);

    component.showPrintOptions();

    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
    expect(windowOpenSpy).not.toHaveBeenCalled();
  });
});
