// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { UnitInfoCodingComponent } from './unit-info-coding.component';

describe('UnitInfoCodingComponent', () => {
  let component: UnitInfoCodingComponent;
  let fixture: ComponentFixture<UnitInfoCodingComponent>;

  @Component({ selector: 'studio-lite-unit-info-loader', template: '', standalone: false })
  class MockUnitInfoLoader {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
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

// Mock the IntersectionObserver, see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
export class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];

  // eslint-disable-next-line class-methods-use-this
  disconnect() {
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  observe() {
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  takeRecords() {
    return [];
  }

  // eslint-disable-next-line class-methods-use-this
  unobserve() {
    return null;
  }
}
window.IntersectionObserver = IntersectionObserver;
global.IntersectionObserver = IntersectionObserver;
