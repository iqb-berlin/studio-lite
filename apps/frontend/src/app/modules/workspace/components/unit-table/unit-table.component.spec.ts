import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { SimpleChange } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { TranslateModule } from '@ngx-translate/core';
import { StatePipe } from '../../pipes/state.pipe';
import { HasNewCommentsPipe } from '../../pipes/has-new-comments.pipe';
import { UnitDropBoxTooltipPipe } from '../../pipes/unit-dropbox-tooltip.pipe';
import { UnitTableComponent } from './unit-table.component';

describe('UnitTableComponent', () => {
  let component: UnitTableComponent;
  let fixture: ComponentFixture<UnitTableComponent>;

  const testUnits: UnitInListDto[] = [
    {
      id: 1, key: 'u1', name: 'Unit 1', groupId: 1
    } as UnitInListDto,
    {
      id: 2, key: 'u2', name: 'Unit 2', groupId: 1
    } as UnitInListDto
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        TranslateModule.forRoot(),
        UnitTableComponent,
        StatePipe,
        HasNewCommentsPipe,
        UnitDropBoxTooltipPipe
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(UnitTableComponent);
    component = fixture.componentInstance;
    component.unitList = testUnits;
    component.dataSource = new MatTableDataSource<UnitInListDto>(testUnits);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes data source if missing on changes', () => {
    component.dataSource = undefined as unknown as MatTableDataSource<UnitInListDto>;
    component.ngOnChanges({});
    expect(component.dataSource).toBeDefined();
    expect(component.dataSource.data).toEqual(testUnits);
  });

  it('applies filter when filter input changes', () => {
    component.filter = 'u1';
    component.ngOnChanges({
      filter: new SimpleChange(null, 'u1', true)
    });
    expect(component.dataSource.filter).toBe('u1');
  });

  it('emits selectUnit event with debounce', fakeAsync(() => {
    const emitSpy = jest.spyOn(component.selectUnit, 'emit');

    component.onUnitClick(1);
    expect(emitSpy).not.toHaveBeenCalled();

    tick(300);
    expect(emitSpy).toHaveBeenCalledWith(1);
  }));

  it('emits sortChange when sorting happens and hasSortHeader is true', () => {
    component.hasSortHeader = true;
    const sortSpy = jest.spyOn(component.sortChange, 'emit');
    const sortState: Sort = { active: 'key', direction: 'asc' };

    component.onSortChange(sortState);

    expect(sortSpy).toHaveBeenCalledWith({ sortState, table: component });
  });

  it('does not emit sortChange when hasSortHeader is false', () => {
    component.hasSortHeader = false;
    const sortSpy = jest.spyOn(component.sortChange, 'emit');
    const sortState: Sort = { active: 'key', direction: 'asc' };

    component.onSortChange(sortState);

    expect(sortSpy).not.toHaveBeenCalled();
  });
});
