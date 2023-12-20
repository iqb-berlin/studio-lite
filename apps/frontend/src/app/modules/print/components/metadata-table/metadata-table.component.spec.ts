import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { MetadataTableComponent } from './metadata-table.component';

describe('MetadataTableComponent', () => {
  let component: MetadataTableComponent;
  let fixture: ComponentFixture<MetadataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataTableComponent],
      imports: [
        MatTableModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataTableComponent);
    component = fixture.componentInstance;
    component.metadata = { entries: [] };
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
