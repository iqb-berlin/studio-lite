import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';
import { UnitChangeComponent } from './unit-change.component';

describe('UnitChangeComponent', () => {
  let component: UnitChangeComponent;
  let fixture: ComponentFixture<UnitChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitChangeComponent],
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

    fixture = TestBed.createComponent(UnitChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
