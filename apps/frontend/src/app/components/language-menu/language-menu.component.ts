import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { WrappedIconComponent } from '../wrapped-icon/wrapped-icon.component';
import { LanguageService } from '../../services/language.service';

/**
 * The language menu in the header. It shows only once there is a second language to choose (#2174);
 * what choosing one does, unsaved changes included, is `LanguageService.switchTo`.
 */
@Component({
  selector: 'studio-lite-language-menu',
  templateUrl: './language-menu.component.html',
  styleUrls: ['./language-menu.component.scss'],
  imports: [
    MatButton, MatMenuTrigger, MatMenu, MatMenuItem, MatTooltip, MatIcon, WrappedIconComponent, TranslateModule
  ]
})
export class LanguageMenuComponent {
  languageService = inject(LanguageService);
}
