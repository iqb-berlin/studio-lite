import { Component, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { MatAnchor, MatFabButton } from '@angular/material/button';

import { AreaTitleComponent } from '../area-title/area-title.component';
import { AppInfoContentComponent } from '../app-info-content/app-info-content.component';

@Component({
  selector: 'studio-lite-app-info',
  templateUrl: './app-info.component.html',
  styleUrls: ['./app-info.component.scss'],
  imports: [AreaTitleComponent, MatAnchor, RouterLink, TranslateModule, AppInfoContentComponent, MatFabButton]
})
export class AppInfoComponent {
  @Input() appTitle!: string;
  @Input() introHtml!: SafeUrl | undefined;
  @Input() userName!: string;
  @Input() userLongName!: string;
  @Input() isUserLoggedIn!: boolean;
  @Input() isAdmin!: boolean;
  @Input() hasReviews!: boolean;
}
