import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PagingMode } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  pagingMode = new BehaviorSubject<PagingMode>('buttons');

  setPagingMode(pagingMode: PagingMode): void {
    this.pagingMode.next(pagingMode);
  }
}
