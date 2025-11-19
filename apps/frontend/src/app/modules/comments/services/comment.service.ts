import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CommentService {
  showHiddenComments: BehaviorSubject<boolean> = new BehaviorSubject(false);
}
