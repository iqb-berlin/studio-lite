import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../../environments/environment';
import { DeleteUnitButtonComponent } from './delete-unit-button.component';

describe('DeleteUnitButtonComponent', () => {
  let component: DeleteUnitButtonComponent;
  let fixture: ComponentFixture<DeleteUnitButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteUnitButtonComponent],
      imports: [
        TranslateModule.forRoot(),
        MatTooltipModule,
        RouterTestingModule,
        HttpClientModule,
        MatSnackBarModule,
        MatDialogModule,
        MatIconModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteUnitButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
