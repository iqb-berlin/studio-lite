import { Directive, HostListener } from '@angular/core';
import { AuthService } from '../modules/auth/service/auth.service';

@Directive({
  selector: '[studioLiteEditMyData]'
})
export class EditMyDataDirective {
  constructor(
    private authService: AuthService
  ) {}

  @HostListener('click') editMyData() {
    this.authService.redirectToProfile();
  }
}
