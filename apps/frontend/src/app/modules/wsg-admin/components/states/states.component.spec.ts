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

  it('should rename only the state whose label was typed in', () => {
    component.addState();
    fixture.detectChanges();
    jest.spyOn(component.hasChanged, 'emit');
    const labelInputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('input[type="text"]'));

    labelInputs[1].value = 'In Arbeit';
    labelInputs[1].dispatchEvent(new Event('input'));

    expect(component.hasChanged.emit).toHaveBeenCalledWith([
      { id: 1, label: 'State 1', color: '#000000' },
      { id: 2, label: 'In Arbeit', color: '#edb211' }
    ]);
  });

  // Deleting saves the group settings at once; Esc and a click beside the dialog give undefined (#1844).
  it.each([false, undefined])('should keep a state when its deletion closes with %s', result => {
    mockMatDialog.open.mockReturnValue({ afterClosed: () => of(result) });
    jest.spyOn(component.hasChanged, 'emit');
    jest.spyOn(component.stateDeleted, 'emit');

    component.deleteState(component.states[0]);

    expect(component.states).toEqual([{ id: 1, label: 'State 1', color: '#000000' }]);
    expect(component.hasChanged.emit).not.toHaveBeenCalled();
    expect(component.stateDeleted.emit).not.toHaveBeenCalled();
  });
});
