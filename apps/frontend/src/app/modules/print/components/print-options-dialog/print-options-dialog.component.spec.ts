import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { PrintOptionsDialogComponent } from './print-options-dialog.component';
import { PrintOptions } from '../../models/print-options.interface';

describe('PrintOptionsDialogComponent', () => {
  let component: PrintOptionsDialogComponent;
  let fixture: ComponentFixture<PrintOptionsDialogComponent>;
  let mockDialogRef: { close: jest.Mock };

  @Component({ selector: 'studio-lite-print-options', template: '', standalone: false })
  class MockPrintOptionsComponent {
    @Input() printOptions!: PrintOptions[];
  }

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [MockPrintOptionsComponent],
      imports: [
        PrintOptionsDialogComponent,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize with dialogRef', () => {
      expect(component.dialogRef).toBeDefined();
      expect(component.dialogRef).toBe(mockDialogRef);
    });
  });

  describe('cancel', () => {
    it('should close the dialog without data', () => {
      component.cancel();

      expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should close the dialog when called multiple times', () => {
      component.cancel();
      component.cancel();

      expect(mockDialogRef.close).toHaveBeenCalledTimes(2);
    });
  });

  describe('dialogRef property', () => {
    it('should be publicly accessible', () => {
      expect(component.dialogRef).toBe(mockDialogRef);
    });

    it('should allow calling close directly', () => {
      component.dialogRef.close('test-data');

      expect(mockDialogRef.close).toHaveBeenCalledWith('test-data');
    });
  });
});
