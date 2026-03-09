import { Directive } from '@angular/core';
import { takeUntil } from 'rxjs';
import { VeronaModuleDirective } from './verona-module.directive';

@Directive({
  selector: '[studioLiteUnitDefinition]',
  standalone: true
})
export abstract class UnitDefinitionDirective extends VeronaModuleDirective {
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
    this.workspaceService
      .getUnitDefinitionStore()
      ?.dataChange.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.sendChangeData();
      });
  }

  abstract sendChangeData(): void;
}
