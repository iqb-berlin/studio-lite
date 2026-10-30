import {
  Component, EventEmitter, Output, OnInit, OnDestroy, signal
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatButton, MatIconButton } from '@angular/material/button';
import { State } from '@studio-lite-lib/api-dto';
import { DeleteStateComponent } from '../delete-state/delete-state.component';
import { WsgAdminService } from '../../services/wsg-admin.service';

@Component({
  selector: 'studio-lite-states',
  templateUrl: './states.component.html',
  styleUrls: ['./states.component.scss'],

  imports: [MatFormField, MatInput, MatIconButton, MatTooltip, MatIcon, MatError, TranslateModule, MatButton]
})
export class StatesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  states: State[] = [];
  changedStates!: State[];
  // Units keep the id of a deleted state, and would show a new state that got it again (#2009).
  private readonly lastStateId = signal(0);
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
    this.lastStateId.update(id => id + 1);
    this.changedStates = [...this.changedStates, {
      id: this.lastStateId(),
      label: '',
      color: '#edb211'
    }];
    this.states = this.changedStates;
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
    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        if (result) {
          this.changedStates = this.changedStates.filter((s: State) => s.id !== state.id);
          this.states = this.changedStates;
          this.hasChanged.emit(this.changedStates);
          this.stateDeleted.emit(this.changedStates);
        }
      });
  }

  ngOnInit(): void {
    this.wsgAdminService.selectedWorkspaceGroupSettings
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(settings => {
        this.states = settings.states || [];
        this.changedStates = this.states;
        this.lastStateId.set(Math.max(settings.lastStateId ?? 0, ...this.states.map(state => state.id)));
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
