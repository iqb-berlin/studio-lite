import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
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
    const mockItems: UnitItemDto[] = [{ uuid: 'u1', id: 'i1' }];
    const spy = jest.spyOn(backendService, 'getAllUnitItems').mockReturnValue(of(mockItems));

    component.ngOnInit();
    tick();

    expect(spy).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(mockItems);
  }));
});
