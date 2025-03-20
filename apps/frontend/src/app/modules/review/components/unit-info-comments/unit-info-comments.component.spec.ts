// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { UnitInfoCommentsComponent } from './unit-info-comments.component';

describe('UnitInfoCommentsComponent', () => {
  let component: UnitInfoCommentsComponent;
  let fixture: ComponentFixture<UnitInfoCommentsComponent>;

  @Component({ selector: 'studio-lite-unit-info-loader', template: '', standalone: false })
  class MockUnitInfoLoader {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockUnitInfoLoader
      ],
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitInfoCommentsComponent);
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
