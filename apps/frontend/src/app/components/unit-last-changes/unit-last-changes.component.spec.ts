import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { UnitLastChangesComponent } from './unit-last-changes.component';

describe('UnitLastChangesComponent', () => {
  let component: UnitLastChangesComponent;
  let fixture: ComponentFixture<UnitLastChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        UnitLastChangesComponent
      ],
      providers: [DatePipe]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitLastChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all change dates with users', () => {
    component.lastChangedDefinition = new Date('2024-01-22T10:00:00');
    component.lastChangedDefinitionUser = 'John Doe';
    component.lastChangedMetadata = new Date('2024-02-23T11:30:00');
    component.lastChangedMetadataUser = 'Jane Doe';
    component.lastChangedScheme = new Date('2024-03-24T12:45:00');
    component.lastChangedSchemeUser = 'Max Mustermann';

    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('John Doe');
    expect(text).toContain('22.01.2024 10:00');
    expect(text).toContain('Jane Doe');
    expect(text).toContain('23.02.2024 11:30');
    expect(text).toContain('Max Mustermann');
    expect(text).toContain('24.03.2024 12:45');
  });

  it('should render no rows when no change dates are set', () => {
    component.lastChangedDefinition = null;
    component.lastChangedMetadata = null;
    component.lastChangedScheme = null;

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tr').length).toBe(0);
  });
});
