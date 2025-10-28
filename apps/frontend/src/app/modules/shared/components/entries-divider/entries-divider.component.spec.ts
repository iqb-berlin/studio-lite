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
});
