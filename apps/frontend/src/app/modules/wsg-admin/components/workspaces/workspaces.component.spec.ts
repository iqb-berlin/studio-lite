// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Component, Input } from '@angular/core';
import { WorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../../../../../environments/environment';
import { WorkspacesComponent } from './workspaces.component';

describe('WorkspacesComponent', () => {
  let component: WorkspacesComponent;
  let fixture: ComponentFixture<WorkspacesComponent>;

  @Component({ selector: 'studio-lite-workspace-menu', template: '', standalone: false })
  class MockWorkspaceMenuComponent {
    @Input() selectedWorkspaceId!: number;
    @Input() isWorkspaceGroupAdmin!: boolean;
    @Input() selectedRows!: WorkspaceInListDto[];
    @Input() checkedRows!: WorkspaceInListDto[];
  }

  @Component({ selector: 'studio-lite-search-filter', template: '', standalone: false })
  class MockSearchFilterComponent {
    @Input() title!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockWorkspaceMenuComponent,
        MockSearchFilterComponent
      ],
      imports: [
        NoopAnimationsModule,
        MatDialogModule,
        MatTableModule,
        MatCheckboxModule,
        HttpClientModule,
        MatSnackBarModule,
        MatListModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
