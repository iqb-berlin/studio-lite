import { Directive } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { WorkspaceService } from '../services/workspace.service';

@Directive({
  selector: '[studioLiteSubscribeUnitDefinitionChanges]',
  standalone: false
})
export abstract class SubscribeUnitDefinitionChangesDirective {
  abstract workspaceService: WorkspaceService;
  abstract ngUnsubscribe: Subject<void>;
  abstract message: string;

  addSubscriptionForUnitDefinitionChanges(): void {
    if (this.workspaceService.getUnitDefinitionStore()) {
      this.subscribeUnitDefinitionChanges();
    } else {
      this.workspaceService.unitDefinitionStoreChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.subscribeUnitDefinitionChanges();
        });
    }
  }

  private subscribeUnitDefinitionChanges() {
    this.workspaceService.getUnitDefinitionStore()?.dataChange
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.message = '';
        this.workspaceService.loadUnitProperties().then(() => this.sendUnitData());
      });
  }

  abstract sendUnitData(): Promise<void>;
}
