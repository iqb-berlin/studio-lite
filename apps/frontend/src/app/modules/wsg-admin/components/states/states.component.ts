import {
  Component, EventEmitter, Output, Input, OnInit
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { State } from '../../../admin/models/state.type';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { DeleteStateComponent } from '../delete-state/delete-state.component';

@Component({
  selector: 'studio-lite-states',
  templateUrl: './states.component.html',
  styleUrls: ['./states.component.scss']
})
export class StatesComponent implements OnInit {
  states: State[] = [];
  selectionChanged!: State[];
  @Output() hasChanged = new EventEmitter<State[]>();
  @Input() statesInput:State[] = [];

  constructor(
    private wsgAdminService: WsgAdminService,
    private deleteStateDialog: MatDialog,
    private translateService:TranslateService
  ) {}

  stateSelectionChange(e:any) {
    const foundState = this.states?.find((state: { id: number; }) => state.id === parseInt(e.target.id, 10));
    if (foundState) {
      this.selectionChanged = this.selectionChanged.map(state => {
        if (state.id === foundState.id) {
          if (e.target.type === 'color') {
            return { ...state, color: e.target?.value };
          }
          if (e.target.type === 'text') {
            return { ...state, label: e.target?.value };
          }
        }
        return state;
      });
    }
    this.hasChanged.emit(this.selectionChanged);
  }

  addState() {
    if (this.selectionChanged) {
      this.selectionChanged.push({
        id: this.selectionChanged.length + 1,
        label: '',
        color: '#edb211'
      });
      this.states = this.selectionChanged;
    } else {
      this.selectionChanged = [{
        id: 1,
        label: '',
        color: '#edb211'
      }];
      this.states = this.selectionChanged;
    }
    this.hasChanged.emit(this.selectionChanged);
  }

  deleteState(state:State) {
    const dialogRef = this.deleteStateDialog.open(DeleteStateComponent, {
      width: '600px',
      data: {
        title: this.translateService.instant('wsg-settings.delete-state'),
        prompt: this.translateService.instant('wsg-settings.delete-state-warning', { state: 'SS' }),
        state: state,
        okButtonLabel: this.translateService.instant('delete')
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.states = this.states?.filter((s: State) => s.id !== state.id)
          .map((s: State, index: number) => ({ ...s, id: index + 1 }));
        this.selectionChanged = this.states as State[];
        this.hasChanged.emit(this.selectionChanged);
      }
    });
  }

  ngOnInit(): void {
    this.states = this.wsgAdminService.selectedWorkspaceGroupSettings.states || [];
    this.selectionChanged = this.states;
  }
}
