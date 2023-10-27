import { Component } from '@angular/core';
import { ProfileFormlyMappingDirective } from '../../directives/profile-formly-mapping.directive';

@Component({
  selector: 'studio-lite-unit-profile',
  templateUrl: './unit-profile.component.html',
  styleUrls: ['./unit-profile.component.scss']
})
export class UnitProfileComponent extends ProfileFormlyMappingDirective {}
