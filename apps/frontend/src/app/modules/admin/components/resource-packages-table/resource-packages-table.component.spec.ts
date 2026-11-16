import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ResourcePackagesTableComponent } from './resource-packages-table.component';
import { environment } from '../../../../../environments/environment';
import { TextSortTableDataSource } from '../../../../models/text-sort-table-data-source.class';

// The selection was held in the checkboxes of the rows shown: the header checkbox ticked them without
// selecting anything, and a package filtered out and back stayed selected, unticked (#433)
describe('ResourcePackagesTableComponent', () => {
  let fixture: ComponentFixture<ResourcePackagesTableComponent>;
  let selected: BehaviorSubject<number[]>;

  const resourcePackages = (): ResourcePackageDto[] => [
    {
      id: 1, name: 'One', elements: ['one.png'], createdAt: new Date('2024-01-01')
    },
    {
      id: 2, name: 'Two', elements: ['two.png'], createdAt: new Date('2024-01-02')
    }
  ];
  const element = (selector: string): HTMLInputElement => fixture.nativeElement.querySelector(selector);
  const click = (selector: string): void => {
    element(selector).click();
    fixture.detectChanges();
  };
  const filter = (value: string): void => {
    fixture.componentInstance.dataSource.filter = value;
    fixture.detectChanges();
  };
  const load = (): void => {
    fixture.componentRef.setInput('dataSource', new TextSortTableDataSource(resourcePackages()));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcePackagesTableComponent);
    selected = new BehaviorSubject<number[]>([]);
    fixture.componentRef.setInput('selectedResourcePackages', selected);
    load();
  });

  it('selects the packages shown with the header checkbox', () => {
    click('[data-cy="selection-scope-shown-only"] button');
    filter('one');

    click('[data-cy="selection-scope-toggle-all"] input');

    expect(selected.value).toEqual([1]);
  });

  it('keeps a package selected and ticked that was filtered out and shown again', () => {
    click('[data-cy="admin-packages-select-One"] input');
    filter('two');
    filter('');

    expect(selected.value).toEqual([1]);
    expect(element('[data-cy="admin-packages-select-One"] input').checked).toBe(true);
  });

  it('empties the selection when the packages are loaded anew', () => {
    click('[data-cy="admin-packages-select-One"] input');

    load();

    expect(selected.value).toEqual([]);
  });
});
