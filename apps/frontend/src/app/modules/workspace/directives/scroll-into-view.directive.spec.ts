import { ElementRef, SimpleChange, SimpleChanges } from '@angular/core';
import { ScrollIntoViewDirective } from './scroll-into-view.directive';

describe('ScrollIntoViewDirective', () => {
  let nativeElement: Partial<HTMLElement>;
  let elementRef: ElementRef<HTMLElement>;
  let directive: ScrollIntoViewDirective;

  beforeEach(() => {
    nativeElement = {
      scrollIntoView: jest.fn()
    };
    elementRef = new ElementRef(nativeElement as HTMLElement);
    directive = new ScrollIntoViewDirective(elementRef);
    directive.rowId = 5;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should schedule scrolling with smooth centered behavior', () => {
    jest.useFakeTimers();

    directive.scrollIntoView();

    expect(nativeElement.scrollIntoView).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(nativeElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center'
    });
  });

  it('should scroll when selectedUnitId matches rowId', () => {
    const scrollSpy = jest.spyOn(directive, 'scrollIntoView');
    const changes: SimpleChanges = {
      selectedUnitId: new SimpleChange(undefined, 5, true)
    };

    directive.ngOnChanges(changes);

    expect(scrollSpy).toHaveBeenCalledTimes(1);
  });

  it('should not scroll when selectedUnitId does not match rowId', () => {
    const scrollSpy = jest.spyOn(directive, 'scrollIntoView');
    const changes: SimpleChanges = {
      selectedUnitId: new SimpleChange(2, 3, false)
    };

    directive.ngOnChanges(changes);

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('should not scroll when selectedUnitId change is missing', () => {
    const scrollSpy = jest.spyOn(directive, 'scrollIntoView');
    const changes: SimpleChanges = {};

    directive.ngOnChanges(changes);

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('should not throw if nativeElement lacks scrollIntoView', () => {
    jest.useFakeTimers();

    const elementRefWithoutScroll = new ElementRef({} as HTMLElement);
    const directiveWithoutScroll = new ScrollIntoViewDirective(elementRefWithoutScroll);

    expect(() => directiveWithoutScroll.scrollIntoView()).not.toThrow();
    jest.runOnlyPendingTimers();
  });
});
