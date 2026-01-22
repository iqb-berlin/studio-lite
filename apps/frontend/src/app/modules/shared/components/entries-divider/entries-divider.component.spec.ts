import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntriesDividerComponent } from './entries-divider.component';

describe('EntriesDividerComponent', () => {
  let component: EntriesDividerComponent;
  let fixture: ComponentFixture<EntriesDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntriesDividerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EntriesDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a div with class "entries-divider"', () => {
    const divider = fixture.nativeElement.querySelector('div.entries-divider');
    expect(divider).toBeTruthy();
  });
});
