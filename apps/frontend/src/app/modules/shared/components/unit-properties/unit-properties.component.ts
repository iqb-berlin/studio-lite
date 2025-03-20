import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { BackendService } from '../../../workspace/services/backend.service';
import { State } from '../../../admin/models/state.type';

@Component({
  selector: 'studio-lite-unit-properties',
  templateUrl: './unit-properties.component.html',
  styleUrls: ['./unit-properties.component.scss'],
  imports: [DatePipe, TranslateModule]
})
export class UnitPropertiesComponent implements OnChanges {
  @Input() workspaceGroupId!: number;
  @Input() name!: string | undefined | null;
  @Input() key!: string | undefined | null;
  @Input() state!: string | undefined | null;
  @Input() description!: string | undefined | null;
  @Input() transcript!: string | undefined | null;
  @Input() reference!: string | undefined | null;
  @Input() groupName!: string | undefined | null;
  @Input() player!: string;
  @Input() editor!: string | undefined | null;
  @Input() schemer!: string | undefined | null;
  @Input() lastChangedDefinition!: Date | undefined | null;
  @Input() lastChangedMetadata!: Date | undefined | null;
  @Input() lastChangedScheme!: Date | undefined | null;
  @Input() lastChangedDefinitionUser!: string | undefined | null;
  @Input() lastChangedMetadataUser!: string | undefined | null;
  @Input() lastChangedSchemeUser!: string | undefined | null;

  states: State[] = [];
  stateLabel: string = '';

  constructor(private backendService: BackendService) {
  }

  ngOnChanges(changes:SimpleChanges): void {
    const stateChange = 'state';
    const workspaceGroupIdChange = 'workspaceGroupId';
    if ((changes[stateChange] || changes[workspaceGroupIdChange]) && this.workspaceGroupId && this.state) {
      if (this.workspaceGroupId && this.state) {
        this.backendService.getWorkspaceGroupStates(this.workspaceGroupId)
          .subscribe(res => {
            if (res.settings) {
              const state = parseInt((this.state as string), 10);
              const states = res.settings.states || [];
              this.stateLabel = states
                .find(s => s.id === state)?.label || '';
            }
          });
      }
    }
  }
}
