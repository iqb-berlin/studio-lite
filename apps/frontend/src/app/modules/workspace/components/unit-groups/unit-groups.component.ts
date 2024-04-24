import {
  Component, Input
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'studio-lite-unit-groups',
  templateUrl: './unit-groups.component.html',
  styleUrls: ['./unit-groups.component.scss'],
  standalone: true,
  imports: [MatIconButton, MatIcon, TranslateModule]
})
export class UnitGroupsComponent {
  @Input() expandedGroups !: number;
  @Input() numberOfGroups !: number;
  @Input() groupsInfo !: string;
  expandAll = new BehaviorSubject<boolean>(true);
}
