import {
  Component, EventEmitter, Output, Input, OnInit
} from '@angular/core';
import { State } from '../../../admin/models/state.type';
import { WsgAdminService } from '../../services/wsg-admin.service';

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
    private wsgAdminService: WsgAdminService
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
        color: ''
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

  deleteState(id:number) {
    this.states = this.states?.filter((state: { id: number; }) => state.id !== id)
      .map((state: State, index: number) => ({ ...state, id: index + 1 }));
    this.selectionChanged = this.states as State[];
    this.hasChanged.emit(this.selectionChanged);
  }

  ngOnInit(): void {
    this.states = this.wsgAdminService.selectedWorkspaceGroupSettings.states || [];
    this.selectionChanged = this.states;
  }
}
