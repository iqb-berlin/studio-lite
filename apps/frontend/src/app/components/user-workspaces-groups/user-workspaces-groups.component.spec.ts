import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UserWorkspacesGroupsComponent } from './user-workspaces-groups.component';

describe('UserWorkspacesGroupsComponent', () => {
  let component: UserWorkspacesGroupsComponent;
  let fixture: ComponentFixture<UserWorkspacesGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserWorkspacesGroupsComponent);
    component = fixture.componentInstance;
    component.workspaceGroups = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
