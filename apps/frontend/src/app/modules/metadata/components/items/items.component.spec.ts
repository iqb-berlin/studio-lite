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
import { ItemsComponent } from './items.component';
import { ItemSortService } from '../../services/item-sort.service';
import { AliasId } from '../../models/alias-id.interface';

describe('ItemsComponent', () => {
  let component: ItemsComponent;
  let fixture: ComponentFixture<ItemsComponent>;
  let mockMatDialog: Partial<MatDialog>;

  beforeEach(async () => {
    mockMatDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(null)
      })
    };

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
});
