import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Whether the hidden comments are currently shown. The switch sits above the list and the comments
 * below it read it, so it is held here rather than passed down through every level.
 */
@Injectable()
export class CommentService {
  showHiddenComments: BehaviorSubject<boolean> = new BehaviorSubject(false);
}
