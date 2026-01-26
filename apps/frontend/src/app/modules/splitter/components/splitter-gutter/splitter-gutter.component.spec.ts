import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitterGutterComponent } from './splitter-gutter.component';

describe('SplitterGutterComponent', () => {
  let component: SplitterGutterComponent;
  let fixture: ComponentFixture<SplitterGutterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitterGutterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SplitterGutterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit startDragging and set pointerPressed on mouseDown', () => {
    jest.spyOn(component.startDragging, 'emit');
    const event = new MouseEvent('mousedown');
    jest.spyOn(event, 'preventDefault');

    component.onPointerDown(event);

    expect(component.pointerPressed).toBe(true);
    expect(component.startDragging.emit).toHaveBeenCalledWith(component.index);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not emit startDragging if isFixed is true', () => {
    component.isFixed = true;
    jest.spyOn(component.startDragging, 'emit');
    const event = new MouseEvent('mousedown');

    component.onPointerDown(event);

    expect(component.pointerPressed).toBe(false);
    expect(component.startDragging.emit).not.toHaveBeenCalled();
  });

  it('should emit dragging when pointerPressed is true on global mouse move', () => {
    component.pointerPressed = true;
    jest.spyOn(component.dragging, 'emit');
    const event = new MouseEvent('mousemove', { clientX: 100 });

    component.onGlobalPointerMove(event);

    expect(component.dragging.emit).toHaveBeenCalledWith({ index: component.index, position: 100 });
  });

  it('should not emit dragging when pointerPressed is false', () => {
    component.pointerPressed = false;
    jest.spyOn(component.dragging, 'emit');
    const event = new MouseEvent('mousemove');

    component.onGlobalPointerMove(event);

    expect(component.dragging.emit).not.toHaveBeenCalled();
  });

  it('should emit stopDragging and reset pointerPressed on global mouse up', () => {
    component.pointerPressed = true;
    jest.spyOn(component.stopDragging, 'emit');

    component.onGlobalPointerUp();

    expect(component.pointerPressed).toBe(false);
    expect(component.stopDragging.emit).toHaveBeenCalledWith(component.index);
  });
});
