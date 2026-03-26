import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { StatesComponent } from './states.component';
import { WsgAdminService } from '../../services/wsg-admin.service';

describe('StatesComponent', () => {
  let component: StatesComponent;
  let fixture: ComponentFixture<StatesComponent>;
  let mockWsgAdminService: Partial<WsgAdminService>;
  let mockMatDialog: { open: jest.Mock };

  beforeEach(async () => {
    mockWsgAdminService = {
      selectedWorkspaceGroupSettings: new BehaviorSubject<WorkspaceGroupSettingsDto>({
        defaultEditor: '',
        defaultPlayer: '',
        defaultSchemer: '',
        states: [{ id: 1, label: 'State 1', color: '#000000' }]
      })
    };

    mockMatDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        StatesComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: WsgAdminService, useValue: mockWsgAdminService },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and init', () => {
    expect(component).toBeTruthy();
    expect(component.states.length).toBe(1);
  });

  it('should handle state change', () => {
    jest.spyOn(component.hasChanged, 'emit');
    component.stateSelectionChange('#ffffff', 'color', '1');
    expect(component.changedStates[0].color).toBe('#ffffff');
    expect(component.hasChanged.emit).toHaveBeenCalled();
  });

  it('should add state', () => {
    const initialLength = component.changedStates.length;
    component.addState();
    expect(component.changedStates.length).toBe(initialLength + 1);
  });

  it('should delete state', () => {
    const stateToDelete = component.states[0];
    jest.spyOn(component.hasChanged, 'emit');
    jest.spyOn(component.stateDeleted, 'emit');

    component.deleteState(stateToDelete);

    expect(mockMatDialog.open).toHaveBeenCalled();
    expect(component.states.length).toBe(0);
    expect(component.hasChanged.emit).toHaveBeenCalled();
    expect(component.stateDeleted.emit).toHaveBeenCalled();
  });
});
