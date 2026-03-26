import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RichNoteTagsEditorComponent } from './rich-note-tags-editor.component';

describe('RichNoteTagsEditorComponent', () => {
  let component: RichNoteTagsEditorComponent;
  let fixture: ComponentFixture<RichNoteTagsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        NoopAnimationsModule,
        RichNoteTagsEditorComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RichNoteTagsEditorComponent);
    component = fixture.componentInstance;
    component.control = new FormControl('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit copyFromGlobalRequested when copyFromGlobal is called', () => {
    const emitSpy = jest.spyOn(component.copyFromGlobalRequested, 'emit');
    component.copyFromGlobal();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should display label', () => {
    component.label = 'Test Label';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.editor-label')?.textContent).toContain('Test Label');
  });

  it('should show global preview when showGlobalPreview is true', () => {
    component.showGlobalPreview = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.global-preview-field')).toBeTruthy();
  });
});
