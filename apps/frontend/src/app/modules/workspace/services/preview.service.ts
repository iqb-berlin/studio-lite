import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PagingMode } from '../models/unit-page.model';

@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  pagingMode = new BehaviorSubject<PagingMode>('separate');

  setPagingMode(pagingMode: PagingMode): void {
    this.pagingMode.next(pagingMode);
  }
}
