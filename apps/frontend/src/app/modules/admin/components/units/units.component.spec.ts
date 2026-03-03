import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { UnitsComponent } from './units.component';
import { UnitsMenuComponent } from '../units-menu/units-menu.component';

describe('UnitsComponent', () => {
  let component: UnitsComponent;
  let fixture: ComponentFixture<UnitsComponent>;

  @Component({ selector: 'studio-lite-units-menu', template: '', standalone: true })
  class MockUnitsMenuComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        UnitsComponent
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .overrideComponent(UnitsComponent, {
        remove: { imports: [UnitsMenuComponent] },
        add: { imports: [MockUnitsMenuComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
