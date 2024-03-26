import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataProfileEntriesComponent } from './metadata-profile-entries.component';

describe('MetadataProfileEntriesComponent', () => {
  let component: MetadataProfileEntriesComponent;
  let fixture: ComponentFixture<MetadataProfileEntriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(MetadataProfileEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
