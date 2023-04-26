// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { UnitSelectionComponent } from './unit-selection.component';

@Component({ selector: 'studio-lite-unit-table', template: '' })
class MockUnitTableComponent {
  @Input() hasSortHeader!: boolean;
  @Input() unitList!: UnitInListDto[];
}

@Component({ selector: 'studio-lite-search-filter', template: '' })
class MockSearchFilterComponent {
  value: string = '';
}

describe('UnitSelectionComponent', () => {
  let component: UnitSelectionComponent;
  let fixture: ComponentFixture<UnitSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitSelectionComponent,
        MockUnitTableComponent,
        MockSearchFilterComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule,
        HttpClientModule
      ],
      providers: [{
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
