import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VocabsComponent } from './vocabs.component';

describe('VocabsComponent', () => {
  let component: VocabsComponent;
  let fixture: ComponentFixture<VocabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VocabsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VocabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
