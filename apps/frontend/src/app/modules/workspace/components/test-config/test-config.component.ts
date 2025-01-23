import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'studio-lite-test-config',
  templateUrl: './test-config.component.html',
  styleUrls: ['./test-config.component.scss'],
  standalone: true,
  imports: [MatCheckbox, FormsModule, MatFormField, MatLabel, MatInput, TranslateModule]
})
export class TestConfigComponent {
  @Input() addTestTakersReview!: number;
  @Input() addTestTakersHot!: number;
  @Input() addTestTakersMonitor!: number;
  @Input() passwordLess!: boolean;

  @Output() addTestTakersReviewChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() addTestTakersHotChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() addTestTakersMonitorChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() addPlayersChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() passwordLessChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() unitsWithOutPlayerChange = new EventEmitter<number[]>();
}
