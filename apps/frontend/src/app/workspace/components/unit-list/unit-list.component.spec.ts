import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { UnitListComponent } from './unit-list.component';

@Component({ selector: 'studio-lite-unit-table', template: '' })
class MockUnitTableComponent {
  @Input() hasSortHeader!: boolean;
  @Input() unitList!: UnitInListDto[];
}

describe('UnitListComponent', () => {
  let component: UnitListComponent;
  let fixture: ComponentFixture<UnitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitListComponent,
        MockUnitTableComponent
      ],
      imports: [
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
