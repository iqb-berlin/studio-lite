import {
  Component, EventEmitter, Output, OnInit
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DeleteStateComponent } from '../delete-state/delete-state.component';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { State } from '../../../admin/models/state.type';

@Component({
    selector: 'studio-lite-states',
    templateUrl: './states.component.html',
    styleUrls: ['./states.component.scss'],
    // eslint-disable-next-line max-len
    imports: [MatProgressSpinner, MatButton, MatFormField, MatInput, MatIconButton, MatTooltip, MatIcon, MatError, TranslateModule]
})
export class StatesComponent implements OnInit {
  states: State[] = [];
  changedStates!: State[];
  isLoading: boolean = false;
  isError: boolean = false;

  @Output() hasChanged = new EventEmitter<State[]>();
  @Output() stateDeleted = new EventEmitter<State[]>();
  constructor(
    private wsgAdminService: WsgAdminService,
    private deleteStateDialog: MatDialog,
    private translateService:TranslateService
  ) {}

  stateSelectionChange(value:string, type:string, id:string) {
    const foundState = this.states
      ?.find((state: { id: number; }) => state.id === parseInt(id, 10));
    if (foundState) {
      this.changedStates = this.changedStates.map(state => {
        if (state.id === foundState.id) {
          if (type === 'color') {
            return { ...state, color: value };
          }
          if (type === 'text') {
            return { ...state, label: value };
          }
        }
        return state;
      });
    }
    this.hasChanged.emit(this.changedStates);
  }

  addState() {
    if (this.changedStates.length) {
      const newId = this.changedStates[this.changedStates.length - 1].id + 1;
      this.changedStates.push({
        id: newId,
        label: '',
        color: '#edb211'
      });
      this.states = this.changedStates;
    } else {
      this.changedStates = [{
        id: 1,
        label: '',
        color: '#edb211'
      }];
      this.states = this.changedStates;
    }
    this.hasChanged.emit(this.changedStates);
  }

  deleteState(state:State) {
    const deleteState = this.changedStates.filter((stateChanged:State) => stateChanged.id === state.id);
    const dialogRef = this.deleteStateDialog.open(DeleteStateComponent, {
      width: '600px',
      data: {
        title: this.translateService.instant('wsg-settings.delete-state'),
        prompt: this.translateService.instant('wsg-settings.delete-state-warning'),
        state: deleteState[0],
        okButtonLabel: this.translateService.instant('delete')
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.states = this.states?.filter((s: State) => s.id !== state.id);
        this.changedStates = this.states as State[];
        this.hasChanged.emit(this.changedStates);
        this.stateDeleted.emit(this.changedStates);
      }
    });
  }

  ngOnInit(): void {
    if (!this.wsgAdminService.selectedWorkspaceGroupSettings.states) {
      this.isLoading = true;
      setTimeout(() => {
        this.states = this.wsgAdminService.selectedWorkspaceGroupSettings.states || [];
        this.changedStates = this.states;
        this.isLoading = false;
      }, 200);
    }
    this.states = this.wsgAdminService.selectedWorkspaceGroupSettings.states || [];
    this.changedStates = this.states;
  }
}
