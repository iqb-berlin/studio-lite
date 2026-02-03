import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaTitleComponent } from './area-title.component';

describe('AreaTitleComponent', () => {
  let component: AreaTitleComponent;
  let fixture: ComponentFixture<AreaTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(AreaTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept title input', () => {
    component.title = 'Test Title';
    fixture.detectChanges();

    expect(component.title).toBe('Test Title');
  });

  it('should have undefined title initially', () => {
    expect(component.title).toBeUndefined();
  });

  it('should accept empty string as title', () => {
    component.title = '';
    fixture.detectChanges();

    expect(component.title).toBe('');
  });

  it('should accept long title', () => {
    const longTitle = 'This is a very long title for testing purposes';
    component.title = longTitle;
    fixture.detectChanges();

    expect(component.title).toBe(longTitle);
  });
});
