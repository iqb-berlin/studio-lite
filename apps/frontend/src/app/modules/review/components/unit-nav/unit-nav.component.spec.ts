import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { BackendService } from '../../../comments/services/backend.service';
import { UnitNavComponent } from './unit-nav.component';
import { environment } from '../../../../../environments/environment';

describe('UnitNavComponent', () => {
  let component: UnitNavComponent;
  let fixture: ComponentFixture<UnitNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatListModule,
        MatTooltipModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        BackendService,
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
