import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PrintOptionsDialogComponent } from './print-options-dialog.component';
import { PrintOptions } from '../../models/print-options.interface';

describe('PrintOptionsDialogComponent', () => {
  let component: PrintOptionsDialogComponent;
  let fixture: ComponentFixture<PrintOptionsDialogComponent>;

  @Component({ selector: 'studio-lite-print-options', template: '', standalone: false })
  class MockPrintOptionsComponent {
    @Input() printOptions!: PrintOptions[];
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockPrintOptionsComponent
      ],
      imports: [
        MatDialogModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
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
});
