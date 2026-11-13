import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { UnitCheckComponent } from './unit-check.component';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { ModuleService } from '../../../../services/module.service';
import { BackendService as CommentsBackendService } from '../../../comments/services/backend.service';

const scheme = (variableCodings: unknown[]): string => JSON.stringify({ version: '3.0', variableCodings });

describe('UnitCheckComponent', () => {
  let fixture: ComponentFixture<UnitCheckComponent>;
  let unitStores: UnitStoresService;
  let hiddenRoutes: string[];
  let getUnitRichNotes: jest.Mock;
  let hasComments: jest.Mock;

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const tabs = () => Array.from(
    element().querySelectorAll('[data-cy^="unit-check-"].section'),
    section => section.getAttribute('data-cy')
  );
  const sectionOf = (tab: string) => element().querySelector(`[data-cy="unit-check-${tab}"]`);

  const create = () => {
    TestBed.configureTestingModule({
      imports: [UnitCheckComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: WorkspaceService,
          useValue: {
            selectedUnit$: new BehaviorSubject(3),
            selectedWorkspaceId: 1,
            workspaceSettings: { hiddenRoutes }
          }
        },
        {
          provide: WorkspaceBackendService,
          useValue: {
            getUnitProperties: () => of({
              id: 3, editor: 'iqb-editor-aspect@2.9', player: 'iqb-player-aspect@2.9', schemer: 'iqb-schemer@2.5'
            }),
            getUnitDefinition: () => of({ definition: '{}', variables: [{ id: '05', alias: '_00a' }] }),
            getUnitScheme: () => of({ scheme: scheme([]), schemeType: 'iqb-standard@3.0' }),
            getUnitRichNotes
          }
        },
        {
          provide: ModuleService,
          useValue: {
            editors: { 'iqb-editor-aspect@2.9': { nameAndVersion: 'Editor' } },
            players: { 'iqb-player-aspect@2.9': { nameAndVersion: 'Player' } },
            schemers: { 'iqb-schemer@2.5': { nameAndVersion: 'Schemer' } },
            loadList: jest.fn()
          }
        }
      ]
    }).overrideComponent(UnitCheckComponent, {
      set: {
        providers: [{
          provide: CommentsBackendService,
          useValue: { hasComments }
        }]
      }
    });
    unitStores = TestBed.inject(UnitStoresService);
    fixture = TestBed.createComponent(UnitCheckComponent);
    fixture.detectChanges();
  };

  beforeEach(() => {
    hiddenRoutes = [];
    hasComments = jest.fn(() => of(true));
    getUnitRichNotes = jest.fn(() => of({ tags: [], notes: [] }));
  });

  it('shows every tab of a complete unit as in order, comments and notes as information', fakeAsync(() => {
    create();

    expect(tabs()).toEqual([
      'unit-check-properties', 'unit-check-editor', 'unit-check-schemer', 'unit-check-comments', 'unit-check-notes'
    ]);
    expect(sectionOf('schemer')?.querySelector('[data-cy="unit-check-ok"]')).toBeTruthy();
    expect(sectionOf('comments')?.querySelector('[data-cy="unit-check-info"]')?.textContent)
      .toBe('unit-check.comments-present');
    expect(sectionOf('notes')?.querySelector('[data-cy="unit-check-info"]')?.textContent)
      .toBe('unit-check.notes-absent');
  }));

  it('leaves out the comments and notes the workspace hides', fakeAsync(() => {
    hiddenRoutes = ['comments', 'notes'];
    create();

    expect(tabs()).toEqual(['unit-check-properties', 'unit-check-editor', 'unit-check-schemer']);
    expect(hasComments).not.toHaveBeenCalled();
    expect(getUnitRichNotes).not.toHaveBeenCalled();
  }));

  // the card reads the unit as it is being edited, so a fix shows before it is saved (#2135)
  it('follows the scheme as the schemer reports it, saved or not', fakeAsync(() => {
    create();

    unitStores.schemeStore()?.setData(
      scheme([{ id: 'd_1', alias: '05', sourceType: 'MANUAL' }]),
      'iqb-standard@3.0'
    );
    fixture.detectChanges();
    expect(sectionOf('schemer')?.querySelector('[data-cy="unit-check-variable-id-conflicts"]')).toBeTruthy();

    unitStores.schemeStore()?.setData(
      scheme([{ id: 'd_1', alias: 'sum', sourceType: 'MANUAL' }]),
      'iqb-standard@3.0'
    );
    fixture.detectChanges();
    expect(sectionOf('schemer')?.querySelector('[data-cy="unit-check-ok"]')).toBeTruthy();
  }));

  it('names a module the unit lost before it is saved', fakeAsync(() => {
    create();

    unitStores.metadataStore()?.setPlayer('');
    fixture.detectChanges();

    expect(Array.from(
      sectionOf('properties')?.querySelectorAll('[data-cy="unit-check-finding"]') ?? [],
      finding => finding.textContent
    )).toEqual(['unit-check.no-player']);
  }));
});
