// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { UserFullDto } from '@studio-lite-lib/api-dto';
import { UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { environment } from '../../../../../environments/environment';
import { UsersComponent } from './users.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  @Component({ selector: 'studio-lite-search-filter', template: '' })
  class MockSearchFilterComponent {
    @Input() title!: string;
  }

  @Component({ selector: 'studio-lite-users-menu', template: '' })
  class MockUsersMenuComponent {
    @Input() selectedUser!: number;
    @Input() selectedRows!: UserFullDto[];
    @Input() checkedRows!: UserFullDto[];

    @Output() userAdded: EventEmitter<UntypedFormGroup> = new EventEmitter<UntypedFormGroup>();
    @Output() usersDeleted: EventEmitter< UserFullDto[]> = new EventEmitter< UserFullDto[]>();
    @Output() userEdited: EventEmitter<{ selection: UserFullDto[], user: UntypedFormGroup }> =
      new EventEmitter<{ selection: UserFullDto[], user: UntypedFormGroup }>();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UsersComponent,
        MockUsersMenuComponent,
        MockSearchFilterComponent,
        WrappedIconComponent
      ],
      imports: [
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

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
