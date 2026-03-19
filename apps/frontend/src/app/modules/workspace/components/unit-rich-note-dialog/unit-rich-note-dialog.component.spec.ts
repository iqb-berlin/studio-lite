import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { UnitRichNoteDialogComponent } from './unit-rich-note-dialog.component';

describe('UnitRichNoteDialogComponent', () => {
  let component: UnitRichNoteDialogComponent;
  let fixture: ComponentFixture<UnitRichNoteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UnitRichNoteDialogComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { workspaceId: 1, unitId: 1 } }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UnitRichNoteDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
