import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RichNoteEditorComponent } from './rich-note-editor.component';

describe('RichNoteEditorComponent', () => {
  let component: RichNoteEditorComponent;
  let fixture: ComponentFixture<RichNoteEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichNoteEditorComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RichNoteEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.editor.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize editor with initial content', () => {
    component.initialHTML = '<p>Hello World</p>';
    component.ngOnInit();
    expect(component.editor.getHTML()).toContain('Hello World');
  });

  it('should get editor data', () => {
    component.selectedItems = ['uuid1'];
    const data = component.getEditorData();
    expect(data.items).toEqual(['uuid1']);
    expect(data.text).toBeDefined();
  });

  it('should toggle bold', () => {
    const spy = jest.spyOn(component.editor, 'chain');
    component.toggleBold();
    expect(spy).toHaveBeenCalled();
  });

  it('should toggle bullet list', () => {
    const spy = jest.spyOn(component.editor, 'chain');
    component.toggleBulletList();
    expect(spy).toHaveBeenCalled();
  });

  it('should set bullet list style', () => {
    const spy = jest.spyOn(component.editor, 'chain');
    component.setBulletListStyle('square');
    expect(spy).toHaveBeenCalled();
  });

  it('should toggle ordered list', () => {
    const spy = jest.spyOn(component.editor, 'chain');
    component.toggleOrderedList();
    expect(spy).toHaveBeenCalled();
  });

  it('should set ordered list style to decimal', () => {
    const spy = jest.spyOn(component.editor, 'chain');
    component.setOrderedListStyle('decimal');
    expect(spy).toHaveBeenCalled();
  });

  it('should set ordered list style to lower-latin', () => {
    const spy = jest.spyOn(component.editor, 'chain');
    component.setOrderedListStyle('lower-latin');
    expect(spy).toHaveBeenCalled();
  });

  it('should set ordered list style to upper-latin', () => {
    const spy = jest.spyOn(component.editor, 'chain');
    component.setOrderedListStyle('upper-latin');
    expect(spy).toHaveBeenCalled();
  });

  it('should set ordered list style to lower-roman', () => {
    const spy = jest.spyOn(component.editor, 'chain');
    component.setOrderedListStyle('lower-roman');
    expect(spy).toHaveBeenCalled();
  });

  it('should set ordered list style to upper-roman', () => {
    const spy = jest.spyOn(component.editor, 'chain');
    component.setOrderedListStyle('upper-roman');
    expect(spy).toHaveBeenCalled();
  });

  it('should set ordered list style to lower-greek', () => {
    const spy = jest.spyOn(component.editor, 'chain');
    component.setOrderedListStyle('lower-greek');
    expect(spy).toHaveBeenCalled();
  });

  it('should update selected items', () => {
    const spy = jest.spyOn(component.selectedItemsChange, 'emit');
    const newItems = ['uuid1', 'uuid2'];
    component.onSelectedItemChange(newItems);
    expect(component.selectedItems).toEqual(newItems);
    expect(spy).toHaveBeenCalledWith(newItems);
  });

  it('should emit content change when editor is updated', () => {
    const spy = jest.spyOn(component.contentChange, 'emit');
    component.editor.commands.setContent('<p>New content</p>');
    // Tiptap's onUpdate might be async or needs a tick
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });
});
