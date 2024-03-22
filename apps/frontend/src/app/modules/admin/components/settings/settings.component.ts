import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UnitExportConfigComponent } from '../unit-export-config/unit-export-config.component';
import { AppLogoComponent } from '../app-logo/app-logo.component';
import { AppConfigComponent } from '../app-config/app-config.component';
import { MatLabel } from '@angular/material/form-field';

@Component({
    selector: 'studio-lite-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: true,
    imports: [MatLabel, AppConfigComponent, AppLogoComponent, UnitExportConfigComponent, TranslateModule]
})
export class SettingsComponent {}
