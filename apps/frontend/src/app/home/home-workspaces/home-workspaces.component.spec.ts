import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeWorkspacesComponent } from './home-workspaces.component';

describe('HomeWorkspacesComponent', () => {
  let component: HomeWorkspacesComponent;
  let fixture: ComponentFixture<HomeWorkspacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeWorkspacesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeWorkspacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
