import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { BackendService } from '../../../comments/services/backend.service';
import { UnitNavComponent } from './unit-nav.component';
import { environment } from '../../../../../environments/environment';

describe('UnitNavComponent', () => {
  let component: UnitNavComponent;
  let fixture: ComponentFixture<UnitNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitNavComponent],
      imports: [
        TranslateModule.forRoot(),
        HttpClientModule,
        MatListModule,
        MatTooltipModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule
      ],
      providers: [
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
