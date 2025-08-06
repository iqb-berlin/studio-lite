import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatLabel } from '@angular/material/form-field';
import { ProfilesRegistryComponent } from '../profiles-registry/profiles-registry.component';
import { AppLogoComponent } from '../app-logo/app-logo.component';
import { AppConfigComponent } from '../app-config/app-config.component';
import { MissingsProfilesConfigComponent } from '../missings-profiles-config/missings-profiles-config.component';
import { UnitExportConfigComponent } from '../unit-export-config/unit-export-config.component';

@Component({
  selector: 'studio-lite-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    MatLabel,
    AppConfigComponent,
    AppLogoComponent,
    ProfilesRegistryComponent,
    TranslateModule,
    MissingsProfilesConfigComponent,
    UnitExportConfigComponent
  ]
})
export class SettingsComponent {}
