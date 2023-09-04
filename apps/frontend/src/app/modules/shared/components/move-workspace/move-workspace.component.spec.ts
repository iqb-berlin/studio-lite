import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoveWorkspaceComponent } from './move-workspace.component';

describe('MoveWorkspaceComponent', () => {
  let component: MoveWorkspaceComponent;
  let fixture: ComponentFixture<MoveWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveWorkspaceComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MoveWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
