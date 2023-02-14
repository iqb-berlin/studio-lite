import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { environment } from '../../../../environments/environment';
import { AddUnitComponent } from './add-unit.component';

describe('AddUnitComponent', () => {
  let component: AddUnitComponent;
  let fixture: ComponentFixture<AddUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddUnitComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatSnackBarModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(AddUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
