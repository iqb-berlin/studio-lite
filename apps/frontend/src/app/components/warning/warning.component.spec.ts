import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningComponent } from './warning.component';

describe('WarningComponent', () => {
  let component: WarningComponent;
  let fixture: ComponentFixture<WarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(WarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept warnMessage input', () => {
    component.warnMessage = 'This is a warning';
    fixture.detectChanges();

    expect(component.warnMessage).toBe('This is a warning');
  });

  it('should handle empty warning message', () => {
    component.warnMessage = '';
    fixture.detectChanges();

    expect(component.warnMessage).toBe('');
  });

  it('should handle long warning messages', () => {
    const longMessage = 'This is a very long warning message that contains ' +
      'a lot of information about something important.';
    component.warnMessage = longMessage;
    fixture.detectChanges();

    expect(component.warnMessage).toBe(longMessage);
  });

  it('should handle warning messages with special characters', () => {
    component.warnMessage = 'Warning: <error> & "critical" issue!';
    fixture.detectChanges();

    expect(component.warnMessage).toBe('Warning: <error> & "critical" issue!');
  });

  it('should handle undefined warning message', () => {
    component.warnMessage = undefined as unknown as string;
    fixture.detectChanges();

    expect(component.warnMessage).toBeUndefined();
  });

  it('should update warnMessage dynamically', () => {
    component.warnMessage = 'First warning';
    fixture.detectChanges();
    expect(component.warnMessage).toBe('First warning');

    component.warnMessage = 'Updated warning';
    fixture.detectChanges();
    expect(component.warnMessage).toBe('Updated warning');
  });
});
