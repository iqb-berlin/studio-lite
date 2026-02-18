import { ElementRef } from '@angular/core';
import { ScrollEditorIntoViewDirective } from './scroll-editor-into-view.directive';

describe('ScrollEditorIntoViewDirective', () => {
  let nativeElement: Partial<HTMLElement>;
  let elementRef: ElementRef<HTMLElement>;
  let directive: ScrollEditorIntoViewDirective;

  beforeEach(() => {
    nativeElement = {
      scrollIntoView: jest.fn()
    };
    elementRef = new ElementRef(nativeElement as HTMLElement);
    directive = new ScrollEditorIntoViewDirective(elementRef);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should schedule scroll when visible', () => {
    jest.useFakeTimers();
    directive.isVisible = true;

    directive.ngOnInit();

    expect(nativeElement.scrollIntoView).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(nativeElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center'
    });
  });

  it('should not scroll when not visible', () => {
    jest.useFakeTimers();
    directive.isVisible = false;

    directive.ngOnInit();
    jest.runOnlyPendingTimers();

    expect(nativeElement.scrollIntoView).not.toHaveBeenCalled();
  });
});
