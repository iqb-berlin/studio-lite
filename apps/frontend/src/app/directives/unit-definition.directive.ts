import { Directive } from '@angular/core';
import { takeUntil } from 'rxjs';
import { VeronaModuleDirective } from './verona-module.directive';

/**
 * The layer between {@link VeronaModuleDirective} and the components that show a unit's definition:
 * it keeps the hosted module in step with the definition store, so a change made in the editor
 * reaches the preview beside it.
 *
 * The store may not exist yet when the component is built -- the unit is still loading -- which is
 * why this waits for it rather than subscribing once and finding nothing.
 */
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
