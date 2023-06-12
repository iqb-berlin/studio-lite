import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { UntypedFormGroup } from '@angular/forms';
import { WorkspaceGroupsComponent } from './workspace-groups.component';
import { environment } from '../../../../../environments/environment';

describe('WorkspaceGroupsComponent', () => {
  let component: WorkspaceGroupsComponent;
  let fixture: ComponentFixture<WorkspaceGroupsComponent>;

  @Component({ selector: 'studio-lite-workspace-groups-menu', template: '' })
  class MockWorkspaceGroupsMenuComponent {
    @Input() selectedWorkspaceGroupId!: number;
    @Input() selectedRows!: WorkspaceGroupInListDto[];
    @Input() checkedRows!: WorkspaceGroupInListDto[];

    @Output() groupAdded: EventEmitter<UntypedFormGroup> = new EventEmitter<UntypedFormGroup>();
    @Output() groupsDeleted: EventEmitter< WorkspaceGroupInListDto[]> = new EventEmitter< WorkspaceGroupInListDto[]>();
    @Output() groupEdited: EventEmitter<{ selection: WorkspaceGroupInListDto[], group: UntypedFormGroup }> =
      new EventEmitter<{ selection: WorkspaceGroupInListDto[], group: UntypedFormGroup }>();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        WorkspaceGroupsComponent,
        MockWorkspaceGroupsMenuComponent
      ],
      imports: [
        MatDialogModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatIconModule,
        MatTableModule,
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspaceGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
