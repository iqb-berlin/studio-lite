import { fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { succeeded } from './succeeded.utils';

describe('succeeded', () => {
  it('turns an answer into true', () => {
    const results: boolean[] = [];
    of({ id: 1 }).pipe(succeeded()).subscribe(result => results.push(result));
    expect(results).toEqual([true]);
  });

  it('turns an empty answer into true', () => {
    const results: boolean[] = [];
    of(null).pipe(succeeded()).subscribe(result => results.push(result));
    expect(results).toEqual([true]);
  });

  it('turns an error into false and completes', () => {
    const results: boolean[] = [];
    let completed = false;
    throwError(() => new Error('403'))
      .pipe(succeeded())
      .subscribe({ next: result => results.push(result), complete: () => { completed = true; } });
    expect(results).toEqual([false]);
    expect(completed).toBe(true);
  });

  it('answers only once the request does', fakeAsync(() => {
    const results: boolean[] = [];
    timer(100).pipe(map(() => 'done'), succeeded()).subscribe(result => results.push(result));
    expect(results).toEqual([]);
    tick(100);
    expect(results).toEqual([true]);
  }));
});
