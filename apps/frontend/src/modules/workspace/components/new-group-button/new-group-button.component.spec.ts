import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NewGroupButtonComponent } from './new-group-button.component';
import { environment } from '../../../../environments/environment';

describe('NewGroupButtonComponent', () => {
  let component: NewGroupButtonComponent;
  let fixture: ComponentFixture<NewGroupButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewGroupButtonComponent],
      imports: [
        TranslateModule.forRoot(),
        MatTooltipModule,
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

    fixture = TestBed.createComponent(NewGroupButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
