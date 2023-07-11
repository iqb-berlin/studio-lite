import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { UnitInfoCodingComponent } from './unit-info-coding.component';

describe('UnitInfoCodingComponent', () => {
  let component: UnitInfoCodingComponent;
  let fixture: ComponentFixture<UnitInfoCodingComponent>;

  @Component({ selector: 'studio-lite-unit-info-loader', template: '' })
  class MockUnitInfoLoader {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitInfoCodingComponent,
        MockUnitInfoLoader
      ],
      imports: [
        TranslateModule.forRoot(),
        HttpClientModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitInfoCodingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
