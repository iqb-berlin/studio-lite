import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { UnitTableComponent } from './unit-table.component';

describe('UnitTableComponent', () => {
  let component: UnitTableComponent;
  let fixture: ComponentFixture<UnitTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTableModule
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(UnitTableComponent);
    component = fixture.componentInstance;
    component.dataSource = new MatTableDataSource<UnitInListDto>([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
