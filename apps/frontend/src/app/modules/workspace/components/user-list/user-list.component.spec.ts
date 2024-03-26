import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { UserInListDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        NoopAnimationsModule,
        MatTableModule,
        MatSortModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user data in table', () => {
    const userData: UserInListDto[] = [
      {
        id: 1,
        name: 'user1',
        isAdmin: true,
        description: 'Some user',
        displayName: 'user1 Tester',
        email: 'user1@example.com'
      },
      {
        id: 2,
        name: 'user2',
        isAdmin: false,
        description: 'Another user',
        displayName: 'user2 Tester',
        email: 'user2@example.com'
      }
    ];

    component.userList = userData;
    fixture.detectChanges();

    const tableRows = fixture.nativeElement.querySelectorAll('mat-row');
    expect(tableRows.length).toBe(userData.length);

    for (let i = 0; i < userData.length; i++) {
      const row = tableRows[i];
      const nameCell = row.querySelector('.mat-column-displayName');
      const emailCell = row.querySelector('.mat-column-email');
      const descriptionCell = row.querySelector('.mat-column-description');

      expect(nameCell.textContent).toContain(userData[i].displayName);
      expect(emailCell.textContent).toContain(userData[i].email);
      expect(descriptionCell.textContent).toContain(userData[i].description);
    }
  });
});
