import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { AppService } from '../../services/app.service';
import { AreaTitleComponent } from '../area-title/area-title.component';
import { LogoutDirective } from '../../directives/logout.directive';

/**
 * Stands in for the login form when a stored login could not be checked because the server did not
 * answer (#2112). The login may well still be valid, so a second attempt is offered rather than a
 * new login.
 *
 * The attempt starts the studio again, on the page the user was sent away from or else on this one:
 * the config and the logo failed along with the check, and only the start fetches them all. Still no
 * answer brings this hint back, a refused login the login form.
 *
 * The logout is the way to the login form for whoever does not want to wait for this login -- to log
 * in with another account, or because the server keeps failing for this one. Without an answer from
 * the server it cannot end the session there, which is the user's choice to make.
 */
@Component({
  selector: 'studio-lite-auth-check-failed',
  templateUrl: './auth-check-failed.component.html',
  styleUrls: ['./auth-check-failed.component.scss'],
  imports: [AreaTitleComponent, MatButton, LogoutDirective, TranslateModule]
})
export class AuthCheckFailedComponent implements OnInit, OnDestroy {
  private hintShownTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private appService: AppService,
    private route: ActivatedRoute
  ) {}

  // While this hint is up, the general message that the server did not answer is left out. Deferred:
  // the messages sit above the start page, in a view that has already been checked.
  ngOnInit(): void {
    this.hintShownTimer = setTimeout(() => this.appService.setNoAnswerHintShown(true));
  }

  retry(): void {
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
    this.restart(redirectTo ? `#${redirectTo}` : null);
  }

  /**
   * Own method so tests can stub it: a real navigation is something jsdom cannot perform.
   * Without a page to go to, the current one is loaded again, review link included.
   */
  // eslint-disable-next-line class-methods-use-this
  private restart(url: string | null): void {
    if (url) window.location.assign(url);
    window.location.reload();
  }

  ngOnDestroy(): void {
    clearTimeout(this.hintShownTimer);
    this.appService.setNoAnswerHintShown(false);
  }
}
