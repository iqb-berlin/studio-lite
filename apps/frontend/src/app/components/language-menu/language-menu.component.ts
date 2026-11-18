import {
  Component, inject, Injector, OnDestroy
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  firstValueFrom, from, isObservable, Subject, takeUntil
} from 'rxjs';
import { WrappedIconComponent } from '../wrapped-icon/wrapped-icon.component';
import { LanguageService } from '../../services/language.service';

/**
 * The language menu in the header. It shows only once there is a second language to choose (#2174).
 * Choosing one reloads the page, which would drop unsaved changes to a unit without a word; so it
 * first asks what leaving the unit asks.
 *
 * The question is the workspace's guard, loaded only when a language is chosen: imported here it
 * would put the guard and its dialog into the bundle every page loads at start.
 */
@Component({
  selector: 'studio-lite-language-menu',
  templateUrl: './language-menu.component.html',
  styleUrls: ['./language-menu.component.scss'],
  imports: [
    MatButton, MatMenuTrigger, MatMenu, MatMenuItem, MatTooltip, MatIcon, WrappedIconComponent, TranslateModule
  ]
})
export class LanguageMenuComponent implements OnDestroy {
  languageService = inject(LanguageService);
  private injector = inject(Injector);
  private ngUnsubscribe = new Subject<void>();

  async select(code: string): Promise<void> {
    if (code === this.languageService.active.code) return;
    const { UnitRoutingCanDeactivateGuard } = await import('../../modules/workspace/guards/unit-routing.guard');
    const mayLeave = this.injector.get(UnitRoutingCanDeactivateGuard).canDeactivate();
    const leave = await firstValueFrom(
      (isObservable(mayLeave) ? mayLeave : from(Promise.resolve(mayLeave))).pipe(takeUntil(this.ngUnsubscribe)),
      { defaultValue: false }
    );
    if (leave === true) this.languageService.switchTo(code);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
