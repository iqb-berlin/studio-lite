import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { SaveOrDiscardComponent } from './save-or-discard.component';
import { environment } from '../../../../../environments/environment';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';

describe('SaveOrDiscardComponent', () => {
  let component: SaveOrDiscardComponent;
  let fixture: ComponentFixture<SaveOrDiscardComponent>;

  const confirmData = {
    title: 't', content: 'c', confirmButtonLabel: 'ok', warning: true, confirmButtonDisabled: false
  };
  const saveButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ...confirmData }
        },
        {
          provide: WorkspaceBackendService,
          useValue: {}
        },
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: WorkspaceService,
          useValue: { selectedWorkspaceId: 1 }
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

  // #2127: a warning alone does not block saving; the guard says when saving is refused
  it('offers saving despite a warning until saving is refused', () => {
    expect(saveButton().disabled).toBe(false);

    component.confirmData.confirmButtonDisabled = true;
    fixture.detectChanges();
    expect(saveButton().disabled).toBe(true);
  });
});
