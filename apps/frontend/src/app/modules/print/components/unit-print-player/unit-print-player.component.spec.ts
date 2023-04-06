import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { UnitPrintPlayerComponent } from './unit-print-player.component';
import { environment } from '../../../../../environments/environment';

describe('UnitPrintPlayerComponent', () => {
  let component: UnitPrintPlayerComponent;
  let fixture: ComponentFixture<UnitPrintPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitPrintPlayerComponent],
      imports: [
        HttpClientModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPrintPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
