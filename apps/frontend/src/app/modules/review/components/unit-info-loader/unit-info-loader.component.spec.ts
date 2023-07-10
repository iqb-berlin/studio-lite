import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitInfoLoaderComponent } from './unit-info-loader.component';

describe('UnitInfoLoaderComponent', () => {
  let component: UnitInfoLoaderComponent;
  let fixture: ComponentFixture<UnitInfoLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitInfoLoaderComponent]
    }).compileComponents();

    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;

    fixture = TestBed.createComponent(UnitInfoLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
