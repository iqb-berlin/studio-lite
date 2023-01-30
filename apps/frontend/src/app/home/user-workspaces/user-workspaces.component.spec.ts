import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UserWorkspacesComponent } from './user-workspaces.component';

describe('UserWorkspacesComponent', () => {
  let component: UserWorkspacesComponent;
  let fixture: ComponentFixture<UserWorkspacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserWorkspacesComponent],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserWorkspacesComponent);
    component = fixture.componentInstance;
    component.workspaceGroups = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
