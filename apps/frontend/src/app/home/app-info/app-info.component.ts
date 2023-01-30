import { Component, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'studio-lite-app-info',
  templateUrl: './app-info.component.html',
  styleUrls: ['./app-info.component.scss']
})
export class AppInfoComponent {
  @Input() appTitle!: string;
  @Input() introHtml!: SafeUrl | undefined;
  @Input() appName!: string;
  @Input() appVersion!: string;
  @Input() userName!: string;
  @Input() userLongName!: string;
  @Input() userId!: number;
  @Input() isAdmin!: boolean;
  @Input() hasReviews!: boolean;
}
