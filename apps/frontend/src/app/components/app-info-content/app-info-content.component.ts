import { Component, Inject, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatList, MatListItemLine, MatListItemTitle } from '@angular/material/list';

@Component({
  selector: 'studio-lite-app-info-content',
  imports: [
    TranslateModule,
    MatList,
    MatListItemTitle,
    MatListItemLine
  ],
  templateUrl: './app-info-content.component.html',
  styleUrl: './app-info-content.component.scss'
})
export class AppInfoContentComponent {
  @Input() isUserLoggedIn!: boolean;
  @Input() hasReviews!: boolean;
  @Input() userLongName!: string;
  @Input() userName!: string;
  @Input() isAdmin!: boolean;

  constructor(@Inject('APP_VERSION') readonly appVersion: string,
              @Inject('APP_NAME') readonly appName: string) {}
}
