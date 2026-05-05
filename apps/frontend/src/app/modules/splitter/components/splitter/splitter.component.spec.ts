import { Component, Input, QueryList } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { SplitterService } from '../../services/splitter.service';
import { SplitterPaneComponent } from '../splitter-pane/splitter-pane.component';
import { SplitterComponent } from './splitter.component';

@Component({
  selector: 'studio-lite-splitter-pane',
  template: '',
  providers: [
    {
      provide: SplitterPaneComponent,
      useClass: MockSplitterPaneComponent
    }
  ],
  standalone: true
})
class MockSplitterPaneComponent {
  @Input() initialSize: number | 'auto' = 'auto';
  @Input() minSize: number = 0;
  @Input() maxSize!: number;
  index: number = 0;
  isLast: boolean = false;
  size: number = 100;
  elementRef = {
    nativeElement: {
      offsetWidth: 100,
      style: {},
      getBoundingClientRect: jest.fn(() => ({ left: 0 }))
    }
  };

  init = jest.fn();
  setStyle = jest.fn();
}

function mockQueryList<T>(items: T[]): QueryList<T> {
  const list = [...items];
  Object.assign(list, { changes: new Subject<void>() });
  return list as unknown as QueryList<T>;
}

describe('SplitterComponent', () => {
  let component: SplitterComponent;
  let fixture: ComponentFixture<SplitterComponent>;

  const mockSplitterService = {
    update: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitterComponent, MockSplitterPaneComponent],
      providers: [
        { provide: SplitterService, useValue: mockSplitterService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SplitterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update content on AfterViewInit', () => {
    const pane1 = new MockSplitterPaneComponent();
    const pane2 = new MockSplitterPaneComponent();
    const panesMock = mockQueryList([
      pane1 as unknown as SplitterPaneComponent,
      pane2 as unknown as SplitterPaneComponent
    ]);

    (component as unknown as { panes: QueryList<SplitterPaneComponent> }).panes = panesMock;
    jest.useFakeTimers();

    component.ngAfterViewInit();
    jest.runAllTimers();

    expect(pane1.init).toHaveBeenCalledWith(0, false);
    expect(pane2.init).toHaveBeenCalledWith(1, true);
  });

  describe('Gutter Dragging', () => {
    let pane1: MockSplitterPaneComponent;
    let pane2: MockSplitterPaneComponent;

    beforeEach(() => {
      pane1 = new MockSplitterPaneComponent();
      pane2 = new MockSplitterPaneComponent();
      pane1.index = 0;
      pane2.index = 1;

      const panesMock = mockQueryList([
        pane1 as unknown as SplitterPaneComponent,
        pane2 as unknown as SplitterPaneComponent
      ]);
      (component as unknown as { panes: QueryList<SplitterPaneComponent> }).panes = panesMock;
    });

    it('should calculate available size on start dragging', () => {
      component.onGutterStartDragging(0);
      expect(component.availablePanesSize).toBe(200); // 100 + 100
    });

    it('should calculate sizes and set styles during dragging', () => {
      component.availablePanesSize = 200;

      component.onGutterDragging({ index: 0, position: 150 });

      expect(pane1.size).toBe(150);
      expect(pane2.size).toBe(50);
      expect(pane1.setStyle).toHaveBeenCalledWith(150);
      expect(pane2.setStyle).toHaveBeenCalledWith(50);
    });

    it('should update service on stop dragging', () => {
      pane1.isLast = false;
      pane1.size = 150;
      pane2.isLast = true;
      pane2.size = 50;

      component.onGutterStopDragging();

      expect(mockSplitterService.update).toHaveBeenCalledWith([150]);
    });
  });
});
