import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppService } from '../../../../services/app.service';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { NewUnitComponent } from './new-unit.component';

jest.mock('../../services/workspace.service');

describe('NewUnitComponent', () => {
  let component: NewUnitComponent;
  let fixture: ComponentFixture<NewUnitComponent>;
  const MockSimpleClass = WorkspaceService as jest.Mocked<typeof WorkspaceService>;
  MockSimpleClass.unitKeyUniquenessValidator
    .mockImplementation(() => () => null);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        NewUnitComponent
      ],
      imports: [
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'test',
            subTitle: 'test',
            key: 'test',
            label: 'test',
            groups: []
          }
        },
        {
          provide: BackendService,
          useValue: {}
        },
        {
          provide: AppService,
          useValue: {}
        },
        {
          provide: WorkspaceService,
          useValue: {}
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component)
      .toBeTruthy();
  });
});
