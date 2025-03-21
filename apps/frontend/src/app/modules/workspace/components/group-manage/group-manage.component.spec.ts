// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { GroupManageComponent } from './group-manage.component';
import { environment } from '../../../../../environments/environment';

describe('GroupManageComponent', () => {
  let component: GroupManageComponent;
  let fixture: ComponentFixture<GroupManageComponent>;

  @Component({ selector: 'studio-lite-select-unit-list', template: '', standalone: false })
  class MockSelectUnitListComponent {
    @Input() disabled!: number[];
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() workspace!: unknown;
    @Input('show-groups') showGroups!: boolean;
    @Input() selectionCount!: number;
    @Input() selectedUnitId!: number;
  }

  @Component({ selector: 'studio-lite-save-changes', template: '', standalone: false })
  class MockSaveChangesComponent {
    @Input() changed!: boolean;
  }

  @Component({ selector: 'studio-lite-group-menu', template: '', standalone: false })
  class MockGroupMenuComponent {
    @Input() selectedGroup!: string;
  }

  @Component({ selector: 'studio-lite-search-filter', template: '', standalone: false })
  class MockSearchFilterComponent {
    @Input() title!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockGroupMenuComponent,
        MockSelectUnitListComponent,
        MockSearchFilterComponent,
        MockSaveChangesComponent
      ],
      imports: [
        NoopAnimationsModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: MAT_DIALOG_DATA,
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
    fixture = TestBed.createComponent(GroupManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
