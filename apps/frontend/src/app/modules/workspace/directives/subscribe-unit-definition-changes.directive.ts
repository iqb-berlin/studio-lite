import { Directive } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { WorkspaceService } from '../services/workspace.service';

@Directive({
  selector: '[studioLiteSubscribeUnitDefinitionChanges]'
})
export abstract class SubscribeUnitDefinitionChangesDirective {
  abstract workspaceService: WorkspaceService;
  abstract ngUnsubscribe: Subject<void>;
  abstract message: string;

  addSubscriptionForUnitDefinitionChanges(): void {
    if (this.workspaceService.unitDefinitionStore) {
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
    this.workspaceService.unitDefinitionStore?.dataChange
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.message = '';
        this.workspaceService.loadUnitMetadata().then(() => this.sendUnitData());
      });
  }

  abstract sendUnitData(): Promise<void>;
}
