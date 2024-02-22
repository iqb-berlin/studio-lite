import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataReadonlyItemsComponent } from './metadata-readonly-items.component';

describe('MetadataReadonlyItemsComponent', () => {
  let component: MetadataReadonlyItemsComponent;
  let fixture: ComponentFixture<MetadataReadonlyItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataReadonlyItemsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataReadonlyItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
