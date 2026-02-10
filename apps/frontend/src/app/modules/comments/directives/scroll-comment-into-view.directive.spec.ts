import { ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { ScrollCommentIntoViewDirective } from './scroll-comment-into-view.directive';

describe('ScrollCommentIntoViewDirective', () => {
  let nativeElement: Partial<HTMLElement>;
  let elementRef: ElementRef<HTMLElement>;
  let directive: ScrollCommentIntoViewDirective;
  let targetId$: Subject<number>;

  beforeEach(() => {
    nativeElement = {
      scrollIntoView: jest.fn()
    };
    elementRef = new ElementRef(nativeElement as HTMLElement);
    directive = new ScrollCommentIntoViewDirective(elementRef);
    targetId$ = new Subject<number>();
    directive.scrollTargetId = targetId$;
    directive.id = 7;
  });

  afterEach(() => {
    targetId$.complete();
  });

  it('should scroll into view when emitted id matches', () => {
    directive.ngOnInit();

    targetId$.next(7);

    expect(nativeElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });
  });

  it('should not scroll when emitted id does not match', () => {
    directive.ngOnInit();

    targetId$.next(9);

    expect(nativeElement.scrollIntoView).not.toHaveBeenCalled();
  });

  it('should stop reacting after destroy', () => {
    directive.ngOnInit();
    directive.ngOnDestroy();

    targetId$.next(7);

    expect(nativeElement.scrollIntoView).not.toHaveBeenCalled();
  });
});
