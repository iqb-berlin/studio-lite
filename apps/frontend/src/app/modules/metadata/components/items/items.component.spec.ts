import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MAT_DIALOG_DATA, MatDialog, MatDialogModule
} from '@angular/material/dialog';
import { ItemsMetadataValues, UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ItemsComponent } from './items.component';
import { ItemSortService } from '../../services/item-sort.service';
import { AliasId } from '../../models/alias-id.interface';
import { WorkspaceService } from '../../../workspace/services/workspace.service';

describe('ItemsComponent', () => {
  let component: ItemsComponent;
  let fixture: ComponentFixture<ItemsComponent>;
  let mockMatDialog: Partial<MatDialog>;
  let mockWorkspaceService: DeepMocked<WorkspaceService>;

  beforeEach(async () => {
    mockMatDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(null)
      })
    };

    mockWorkspaceService = createMock<WorkspaceService>({
      workspaceSettings: {
        itemMDProfile: 'test-profile-url',
        unitMDProfile: '',
        defaultEditor: '',
        defaultPlayer: '',
        defaultSchemer: '',
        unitGroups: [],
        stableModulesOnly: true
      }
    });

    await TestBed.configureTestingModule({
      imports: [
        MatTooltipModule,
        MatIconModule,
        MatDialogModule,
        TranslateModule.forRoot(),
        ItemsComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: WorkspaceService, useValue: mockWorkspaceService },
        ItemSortService,
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemsComponent);
    component = fixture.componentInstance;
    component.variablesLoader = new BehaviorSubject<AliasId[]>([]);
    component.metadata = { items: [] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize items from metadata on ngOnInit', () => {
    component.metadata = { items: [{ id: 'item1' } as unknown as ItemsMetadataValues] };
    component.ngOnInit();
    expect(component.items.length).toBe(1);
    expect(component.items[0].id).toBe('item1');
  });

  it('should add an empty item when add is called and items list is empty', () => {
    const emitSpy = jest.spyOn(component.metadataChange, 'emit');
    component.items = [];
    component.add();
    expect(component.items.length).toBe(1);
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should open dialog when add is called and items list is not empty', () => {
    component.items = [{ id: 'item1' } as unknown as ItemsMetadataValues];
    component.add();
    expect(mockMatDialog.open).toHaveBeenCalled();
  });

  it('should remove an item after delete confirmation', () => {
    const emitSpy = jest.spyOn(component.metadataChange, 'emit');
    component.items = [{ id: 'item1' } as unknown as ItemsMetadataValues];
    mockMatDialog.open = jest.fn().mockReturnValue({
      afterClosed: () => of(true)
    });

    component.openDeleteDialog(0);
    expect(component.items.length).toBe(0);
    expect(emitSpy).toHaveBeenCalledWith(component.metadata as UnitMetadataValues);
  });

  it('should toggle presentation view', () => {
    expect(component.isTextOnlyView).toBe(false);
    component.togglePresentation();
    expect(component.isTextOnlyView).toBe(true);
  });

  it('should copy current profile metadata and clear non-current profile metadata when onCloseDialog is called', () => {
    const itemToCopy = {
      id: 'item1',
      uuid: 'old-uuid',
      profiles: [
        {
          profileId: 'test-profile-url',
          isCurrent: false, // fallback will match with workspaceSettings.itemMDProfile
          entries: [{ id: 'entry1', value: 'value1' }]
        },
        {
          profileId: 'other-profile-url',
          isCurrent: false,
          entries: [{ id: 'entry2', value: 'value2' }]
        }
      ]
    } as unknown as ItemsMetadataValues;

    component.items = [itemToCopy];
    const emitSpy = jest.spyOn(component.metadataChange, 'emit');

    ((component as unknown) as { onCloseDialog: (r?: number) => void }).onCloseDialog(0);

    expect(component.items.length).toBe(2);
    const copiedItem = component.items[1];
    expect(copiedItem.id).toBeUndefined();
    expect(copiedItem.uuid).toBeUndefined();
    expect(copiedItem.profiles).toBeDefined();
    expect(copiedItem.profiles?.length).toBe(2);

    // Current profile: metadata entries copied, isCurrent set to true
    const currentProfile = copiedItem.profiles?.[0];
    expect(currentProfile?.profileId).toBe('test-profile-url');
    expect(currentProfile?.isCurrent).toBe(true);
    expect(currentProfile?.entries).toEqual([{ id: 'entry1', value: 'value1' }]);

    // Non-current profile: metadata entries cleared, profileId preserved, isCurrent false
    const nonCurrentProfile = copiedItem.profiles?.[1];
    expect(nonCurrentProfile?.profileId).toBe('other-profile-url');
    expect(nonCurrentProfile?.isCurrent).toBe(false);
    expect(nonCurrentProfile?.entries).toEqual([]);

    expect(emitSpy).toHaveBeenCalled();
  });
});
