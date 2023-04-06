import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RequestMessageDialogComponent } from './request-message-dialog.component';

describe('RequestMessageDialogComponent', () => {
  let component: RequestMessageDialogComponent;
  let fixture: ComponentFixture<RequestMessageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestMessageDialogComponent],
      imports: [
        MatDialogModule,
        MatIconModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { source: 'test', messages: [] }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestMessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
