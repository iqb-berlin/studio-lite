import { Component } from '@angular/core';
import { AppService } from '../../../app.service';

@Component({
  selector: 'studio-lite-unit-comments',
  templateUrl: './unit-comments.component.html',
  styleUrls: ['./unit-comments.component.scss']
})
export class UnitCommentsComponent {
  constructor(public appService: AppService) {}
}
