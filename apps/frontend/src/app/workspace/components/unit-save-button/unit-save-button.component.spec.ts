import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';
import { UnitSaveButtonComponent } from './unit-save-button.component';

describe('UnitSaveButtonComponent', () => {
  let component: UnitSaveButtonComponent;
  let fixture: ComponentFixture<UnitSaveButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitSaveButtonComponent],
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

    fixture = TestBed.createComponent(UnitSaveButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
