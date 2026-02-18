import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  ActivatedRoute, provideRouter, Router
} from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { UnitDataAreaComponent } from './unit-data-area.component';
import { environment } from '../../../../../environments/environment';

describe('UnitDataAreaComponent', () => {
  let component: UnitDataAreaComponent;
  let fixture: ComponentFixture<UnitDataAreaComponent>;
  let routerMock: Router;
  let routeMock: ActivatedRoute;

  beforeEach(async () => {
    routerMock = {
      navigate: jest.fn()
    } as unknown as Router;
    routeMock = { snapshot: {} } as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [
        MatTabsModule
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: Router,
          useValue: routerMock
        },
        {
          provide: ActivatedRoute,
          useValue: routeMock
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitDataAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit selectedRouterIndexChange on active link', fakeAsync(() => {
    const emitSpy = jest.spyOn(component.selectedRouterIndexChange, 'emit');
    (component as { nav?: { selectedIndex: number } }).nav = { selectedIndex: 2 };

    component.onActiveRouterLinkChange(true);
    tick();

    expect(emitSpy).toHaveBeenCalledWith(2);
  }));

  it('should navigate when toggling pinned tab', () => {
    component.secondaryRoutingOutlet = 'side';
    component.togglePinnedTab(['tab']);

    expect(routerMock.navigate).toHaveBeenCalledWith(
      [{ outlets: { side: ['tab'] } }],
      { relativeTo: routeMock }
    );
  });
});
