import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { UnitDataAreaComponent } from './unit-data-area.component';
import { environment } from '../../../../environments/environment';

describe('UnitDataAreaComponent', () => {
  let component: UnitDataAreaComponent;
  let fixture: ComponentFixture<UnitDataAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitDataAreaComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule
      ],
      providers: [{
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
