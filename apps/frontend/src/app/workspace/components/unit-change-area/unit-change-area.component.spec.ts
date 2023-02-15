import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';
import { UnitChangeAreaComponent } from './unit-change-area.component';

describe('UnitChangeAreaComponent', () => {
  let component: UnitChangeAreaComponent;
  let fixture: ComponentFixture<UnitChangeAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitChangeAreaComponent],
      imports: [
        MatIconModule,
        MatSnackBarModule,
        MatDialogModule,
        HttpClientModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitChangeAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
