import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { SaveOrDiscardComponent } from './save-or-discard.component';
import { environment } from '../../../../../environments/environment';
import { BackendService } from '../../services/backend.service';

describe('SaveOrDiscardComponent', () => {
  let component: SaveOrDiscardComponent;
  let fixture: ComponentFixture<SaveOrDiscardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        TranslateModule.forRoot(),
        HttpClientModule
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        {
          provide: BackendService,
          useValue: {}
        },
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveOrDiscardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component)
      .toBeTruthy();
  });
});
