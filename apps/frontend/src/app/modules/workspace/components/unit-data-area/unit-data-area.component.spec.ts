import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UnitDataAreaComponent } from './unit-data-area.component';
import { environment } from '../../../../../environments/environment';

describe('UnitDataAreaComponent', () => {
  let component: UnitDataAreaComponent;
  let fixture: ComponentFixture<UnitDataAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTabsModule
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
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
});
