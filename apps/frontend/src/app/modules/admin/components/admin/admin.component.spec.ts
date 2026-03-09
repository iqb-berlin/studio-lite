import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { provideRouter } from '@angular/router';
import { AdminComponent } from './admin.component';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminComponent,
        MatTabsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have navigation links defined', () => {
    expect(component.navLinks).toBeDefined();
    expect(component.navLinks.length).toBeGreaterThan(0);
  });

  it('should have correct navigation links', () => {
    const expectedLinks = [
      'users',
      'workspace-groups',
      'workspaces',
      'units',
      'v-modules',
      'widgets',
      'settings',
      'packages'
    ];
    expect(component.navLinks).toEqual(expectedLinks);
  });
});
