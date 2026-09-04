import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PagingMode } from '../models/types';

/**
 * How the preview pages a unit -- by buttons, by scrolling, or not at all. Set by the preview's own
 * controls and read by the player host, which are not in the same component tree.
 */
@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  pagingMode = new BehaviorSubject<PagingMode>('buttons');

  setPagingMode(pagingMode: PagingMode): void {
    this.pagingMode.next(pagingMode);
  }
}
