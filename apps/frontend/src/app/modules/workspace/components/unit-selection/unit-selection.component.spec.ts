// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { UnitSelectionComponent } from './unit-selection.component';

@Component({ selector: 'studio-lite-unit-table', template: '', standalone: false })
class MockUnitTableComponent {
  @Input() hasSortHeader!: boolean;
  @Input() unitList!: UnitInListDto[];
}

@Component({ selector: 'studio-lite-search-filter', template: '', standalone: false })
class MockSearchFilterComponent {
  value: string = '';
}

@Component({ selector: 'studio-lite-unit-groups', template: '', standalone: false })
class MockUnitGroupsComponent {
  @Input() expandedGroups !: number;
  @Input() numberOfGroups !: number;
  @Input() groupsInfo !: string;
  @Input() 'unitGroupList' !: [];
}

describe('UnitSelectionComponent', () => {
  let component: UnitSelectionComponent;
  let fixture: ComponentFixture<UnitSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockUnitTableComponent,
        MockSearchFilterComponent,
        MockUnitGroupsComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
