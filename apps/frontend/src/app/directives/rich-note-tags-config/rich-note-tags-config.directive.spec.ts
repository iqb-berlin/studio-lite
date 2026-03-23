import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { RichNoteTagsConfigDirective } from './rich-note-tags-config.directive';

@Component({
  template: '',
  standalone: true,
  imports: [ReactiveFormsModule]
})
class MockTagsConfigComponent extends RichNoteTagsConfigDirective {
}

describe('RichNoteTagsConfigDirective', () => {
  let component: MockTagsConfigComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MockTagsConfigComponent]
    });
    const fixture = TestBed.createComponent(MockTagsConfigComponent);
    component = fixture.componentInstance;
  });

  it('should initialize configForm and tagsJsonControl', () => {
    expect(component.configForm).toBeDefined();
    expect(component.tagsJsonControl).toBeDefined();
    expect(component.configForm.get('tagsJson')).toBe(component.tagsJsonControl);
  });

  it('should parse tags correctly', () => {
    component.tagsJsonControl.setValue('[{"id":"t1","label":"Tag 1"}]');
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const tags = component['parseTags'](); // access protected
    expect(tags.length).toBe(1);
    expect(tags[0].id).toBe('t1');
  });

  it('should return empty array for invalid/empty JSON', () => {
    component.tagsJsonControl.setValue('');
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(component['parseTags']()).toEqual([]);

    component.tagsJsonControl.setValue('   ');
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(component['parseTags']()).toEqual([]);
  });
});
