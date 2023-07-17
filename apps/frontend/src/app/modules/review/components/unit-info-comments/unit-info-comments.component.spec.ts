import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { UnitInfoCommentsComponent } from './unit-info-comments.component';

describe('UnitInfoCommentsComponent', () => {
  let component: UnitInfoCommentsComponent;
  let fixture: ComponentFixture<UnitInfoCommentsComponent>;

  @Component({ selector: 'studio-lite-unit-info-loader', template: '' })
  class MockUnitInfoLoader {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitInfoCommentsComponent,
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

    fixture = TestBed.createComponent(UnitInfoCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
