import {
  Component, Input
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'studio-lite-unit-groups',
  templateUrl: './unit-groups.component.html',
  styleUrls: ['./unit-groups.component.scss']
})
export class UnitGroupsComponent {
  @Input() expandedGroups !: number;
  @Input() numberOfGroups !: number;
  @Input() groupsInfo !: string;
  expandAll = new BehaviorSubject<boolean>(true);
}
