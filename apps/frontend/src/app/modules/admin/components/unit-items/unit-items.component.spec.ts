import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UnitItemInViewDto } from '@studio-lite-lib/api-dto';
import { UnitItemsComponent } from './unit-items.component';
import { BackendService } from '../../services/backend.service';
import { environment } from '../../../../../environments/environment';

describe('UnitItemsComponent', () => {
  let component: UnitItemsComponent;
  let fixture: ComponentFixture<UnitItemsComponent>;
  let backendService: BackendService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        UnitItemsComponent
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitItemsComponent);
    component = fixture.componentInstance;
    backendService = TestBed.inject(BackendService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all unit items on init', fakeAsync(() => {
    const mockItems = [{ uuid: 'u1', id: 'i1' }] as UnitItemInViewDto[];
    const spy = jest.spyOn(backendService, 'getAllUnitItems').mockReturnValue(of(mockItems));

    component.ngOnInit();
    tick();

    expect(spy).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(mockItems);
  }));

  // A unit's address is /a/<workspace>/<unit>. The link used to put the unit id where the
  // workspace belongs, which opened a workspace that does not exist (#1698).
  it('should link the unit id to the unit inside its workspace', fakeAsync(() => {
    const item = {
      uuid: 'u1', id: 'i1', unitId: 136421, workspaceId: 42
    } as UnitItemInViewDto;
    jest.spyOn(backendService, 'getAllUnitItems').mockReturnValue(of([item]));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.cdk-column-unitId a');
    expect(link.getAttribute('href')).toBe('/a/42/136421');
    expect(link.textContent?.trim()).toBe('136421');
  }));
});
