import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { SimpleChange } from '@angular/core';
import { UnitPropertiesComponent } from './unit-properties.component';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';

describe('UnitPropertiesComponent', () => {
  let component: UnitPropertiesComponent;
  let fixture: ComponentFixture<UnitPropertiesComponent>;
  let mockBackendService: Partial<WorkspaceBackendService>;

  beforeEach(async () => {
    mockBackendService = {
      getWorkspaceGroupStates: jest.fn().mockReturnValue(of({
        settings: {
          states: [
            { id: 1, label: 'State 1', color: 'red' },
            { id: 2, label: 'State 2', color: 'blue' }
          ]
        }
      }))
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        UnitPropertiesComponent
      ],
      providers: [
        { provide: WorkspaceBackendService, useValue: mockBackendService },
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getWorkspaceGroupStates and update stateLabel in ngOnChanges', () => {
    component.workspaceGroupId = 100;
    component.state = '2';

    component.ngOnChanges({
      state: new SimpleChange(null, '2', true)
    });

    expect(mockBackendService.getWorkspaceGroupStates).toHaveBeenCalledWith(100);
    expect(component.stateLabel).toBe('State 2');
  });

  it('should not call getWorkspaceGroupStates if missing inputs', () => {
    component.workspaceGroupId = 0;
    component.state = '';

    component.ngOnChanges({
      state: new SimpleChange(null, '', true)
    });

    expect(mockBackendService.getWorkspaceGroupStates).not.toHaveBeenCalled();
  });

  it('should render all properties in the table', () => {
    component.stateLabel = 'Resolved State';
    component.groupName = 'Group A';
    component.description = 'A test description';
    component.transcript = 'Test transcript';
    component.player = 'Player 1.0';
    component.editor = 'Editor 1.0';
    component.schemer = 'Schemer 1.0';
    component.lastChangedDefinition = new Date('2024-01-22T10:00:00');
    component.lastChangedDefinitionUser = 'John Doe';

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent;

    expect(text).toContain('Resolved State');
    expect(text).toContain('Group A');
    expect(text).toContain('A test description');
    expect(text).toContain('Test transcript');
    expect(text).toContain('Player 1.0');
    expect(text).toContain('Editor 1.0');
    expect(text).toContain('Schemer 1.0');
    expect(text).toContain('John Doe');
    // DatePipe format: dd.MM.yyyy HH:mm
    expect(text).toContain('22.01.2024 10:00');
  });
});
