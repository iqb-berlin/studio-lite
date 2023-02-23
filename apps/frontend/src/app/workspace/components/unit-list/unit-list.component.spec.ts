// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { UnitListComponent } from './unit-list.component';

@Component({ selector: 'studio-lite-unit-table', template: '' })
class MockUnitTableComponent {
  @Input() hasSortHeader!: boolean;
  @Input() unitList!: UnitInListDto[];
}

@Component({ selector: 'studio-lite-search-unit', template: '' })
class MockSearchUnitComponent {
  value: string = '';
}

describe('UnitListComponent', () => {
  let component: UnitListComponent;
  let fixture: ComponentFixture<UnitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitListComponent,
        MockUnitTableComponent,
        MockSearchUnitComponent
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

    fixture = TestBed.createComponent(UnitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
