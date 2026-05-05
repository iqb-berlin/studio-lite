import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitterGutterComponent } from './splitter-gutter.component';

describe('SplitterGutterComponent', () => {
  let component: SplitterGutterComponent;
  let fixture: ComponentFixture<SplitterGutterComponent>;

  beforeEach(async () => {
    if (!('PointerEvent' in window)) {
      class PointerEventMock extends MouseEvent {
        pointerId: number;
        constructor(type: string, params: PointerEventInit = {}) {
          super(type, params);
          this.pointerId = params.pointerId || 0;
        }
      }
      Object.defineProperty(window, 'PointerEvent', {
        value: PointerEventMock,
        writable: true
      });
    }

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

  it('should emit startDragging and set pointerPressed on pointerdown', () => {
    jest.spyOn(component.startDragging, 'emit');
    const event = new PointerEvent('pointerdown');
    const target = document.createElement('div');
    Object.defineProperty(event, 'target', { value: target });
    target.setPointerCapture = jest.fn();

    component.onPointerDown(event);

    expect(component.pointerPressed).toBe(true);
    expect(target.setPointerCapture).toHaveBeenCalledWith(event.pointerId);
    expect(component.startDragging.emit).toHaveBeenCalledWith(component.index);
  });

  it('should not emit startDragging if isFixed is true', () => {
    component.isFixed = true;
    jest.spyOn(component.startDragging, 'emit');
    const event = new PointerEvent('pointerdown');

    component.onPointerDown(event);

    expect(component.pointerPressed).toBe(false);
    expect(component.startDragging.emit).not.toHaveBeenCalled();
  });

  it('should emit dragging when pointerPressed is true on global pointer move', () => {
    component.pointerPressed = true;
    jest.spyOn(component.dragging, 'emit');
    const event = new PointerEvent('pointermove', { clientX: 100 });

    component.onGlobalPointerMove(event);

    expect(component.dragging.emit).toHaveBeenCalledWith({ index: component.index, position: 100 });
  });

  it('should not emit dragging when pointerPressed is false', () => {
    component.pointerPressed = false;
    jest.spyOn(component.dragging, 'emit');
    const event = new PointerEvent('pointermove');

    component.onGlobalPointerMove(event);

    expect(component.dragging.emit).not.toHaveBeenCalled();
  });

  it('should emit stopDragging and reset pointerPressed on global pointer up', () => {
    component.pointerPressed = true;
    jest.spyOn(component.stopDragging, 'emit');
    const event = new PointerEvent('pointerup');
    const target = document.createElement('div');
    Object.defineProperty(event, 'target', { value: target });
    target.releasePointerCapture = jest.fn();

    component.onGlobalPointerUp(event);

    expect(component.pointerPressed).toBe(false);
    expect(target.releasePointerCapture).toHaveBeenCalledWith(event.pointerId);
    expect(component.stopDragging.emit).toHaveBeenCalledWith(component.index);
  });
});
