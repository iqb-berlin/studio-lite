import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { UnitPrintCodingComponent } from './unit-print-coding.component';
import { environment } from '../../../../../environments/environment';

describe('UnitPrintCodingComponent', () => {
  let component: UnitPrintCodingComponent;
  let fixture: ComponentFixture<UnitPrintCodingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitPrintCodingComponent],
      imports: [
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPrintCodingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
