// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { GroupManageComponent } from './group-manage.component';
import { environment } from '../../../../../environments/environment';

describe('GroupManageComponent', () => {
  let component: GroupManageComponent;
  let fixture: ComponentFixture<GroupManageComponent>;

  @Component({ selector: 'studio-lite-select-unit-list', template: '' })
  class MockSelectUnitListComponent {
    @Input() disabled!: number[];
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() workspace!: unknown;
    @Input('show-groups') showGroups!: boolean;
    @Input() selectionCount!: number;
  }

  @Component({ selector: 'studio-lite-group-menu', template: '' })
  class MockGroupMenuComponent {
    @Input() selectedGroup!: string;
  }

  @Component({ selector: 'studio-lite-search-filter', template: '' })
  class MockSearchFilterComponent {
    @Input() title!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        GroupManageComponent,
        MockGroupMenuComponent,
        MockSelectUnitListComponent,
        MockSearchFilterComponent
      ],
      imports: [
        HttpClientModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
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
