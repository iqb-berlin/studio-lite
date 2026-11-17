import { Directive, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../services/app.service';
import { BackendService } from '../services/backend.service';

/**
 * Logs out and goes to the login, which leads back to the page after it. That helps where a login
 * can change something: one that has lapsed (401, 410), and a review whose workspace the logged-in
 * account cannot reach, which is opened with the review's own name and password instead (#1818).
 * A 403 elsewhere means the same account without the right, and logging in again with it brings the
 * same answer (#2156).
 *
 * The logout comes before the navigation, unlike {@link LogoutDirective}: the start page is to come
 * up with its login, not with the account that is just being left.
 */
@Directive({
  selector: '[studioLiteLoginAgain]',
  standalone: true
})
export class LoginAgainDirective {
  private backendService = inject(BackendService);
  private appService = inject(AppService);
  private router = inject(Router);

  @HostListener('click') loginAgain(): void {
    const { url } = this.router.routerState.snapshot;
    this.backendService.logout();
    this.appService.clearErrorMessages();
    this.router.navigate(['/'], { queryParams: { redirectTo: url === '/' ? '' : url } });
  }
}
