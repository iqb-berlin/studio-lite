import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { WrappedIconComponent } from './wrapped-icon.component';

describe('WrappedIconComponent', () => {
  let component: WrappedIconComponent;
  let fixture: ComponentFixture<WrappedIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        WrappedIconComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WrappedIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the icon name in mat-icon', () => {
    component.icon = 'home';
    fixture.detectChanges();
    const iconElement = fixture.nativeElement.querySelector('mat-icon');
    expect(iconElement.textContent.trim()).toBe('home');
  });
});
