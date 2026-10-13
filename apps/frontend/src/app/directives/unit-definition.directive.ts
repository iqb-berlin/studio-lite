import { Directive } from '@angular/core';
import { EMPTY, switchMap, takeUntil } from 'rxjs';
import { VeronaModuleDirective } from './verona-module.directive';

/**
 * The layer between {@link VeronaModuleDirective} and the components that show a unit's definition:
 * it keeps the hosted module in step with the definition store, so a change made in the editor
 * reaches the preview beside it.
 *
 * The store may not exist yet when the component is built -- the unit is still loading -- and is
 * replaced when another unit is opened, which is why this follows whichever store there is rather
 * than the one it finds when subscribing.
 */
@Directive({
  selector: '[studioLiteUnitDefinition]',
  standalone: true
})
export abstract class UnitDefinitionDirective extends VeronaModuleDirective {
  addSubscriptionForUnitDefinitionChanges(): void {
    this.unitStores.definitionStore$
      .pipe(
        switchMap(store => store?.dataChange ?? EMPTY),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => this.sendChangeData());
  }

  abstract sendChangeData(): void;
}
