import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { MatCheckboxChange, MatCheckboxModule, MatCheckbox } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { QueryList } from '@angular/core';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ResourcePackagesTableComponent } from './resource-packages-table.component';
import { environment } from '../../../../../environments/environment';

describe('ResourcePackagesTableComponent', () => {
  let component: ResourcePackagesTableComponent;
  let fixture: ComponentFixture<ResourcePackagesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatTableModule,
        MatCheckboxModule,
        MatSortModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcePackagesTableComponent);
    component = fixture.componentInstance;
    const resourcePackages: ResourcePackageDto[] = [
      {
        id: 1,
        name: 'One',
        elements: ['one.png'],
        createdAt: new Date('2024-01-01')
      },
      {
        id: 2,
        name: 'Two',
        elements: ['two.png'],
        createdAt: new Date('2024-01-02')
      }
    ];
    component.dataSource = new MatTableDataSource(resourcePackages);
    component.selectedResourcePackages = new BehaviorSubject<number[]>([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates selectedResourcePackages from checked rows', () => {
    const checkBoxes = [
      { checked: true } as MatCheckbox,
      { checked: true } as MatCheckbox,
      { checked: false } as MatCheckbox
    ];
    const queryList = new QueryList<MatCheckbox>();
    queryList.reset(checkBoxes);
    component.checkBoxes = queryList;

    component.updateSelectedResourcePackages();

    expect(component.selectedResourcePackages.value).toEqual([1]);
  });

  it('toggles all checkboxes', () => {
    const checkBoxes = [
      { checked: false } as MatCheckbox,
      { checked: false } as MatCheckbox
    ];
    const queryList = new QueryList<MatCheckbox>();
    queryList.reset(checkBoxes);
    component.checkBoxes = queryList;

    component.toggleCheckBoxes({ checked: true } as MatCheckboxChange);

    expect(checkBoxes[0].checked).toBe(true);
    expect(checkBoxes[1].checked).toBe(true);
  });
});
