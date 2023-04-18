import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../../../environments/environment';
import { WsgAdminComponent } from './wsg-admin.component';

describe('WsgAdminComponent', () => {
  let component: WsgAdminComponent;
  let fixture: ComponentFixture<WsgAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        WsgAdminComponent
      ],
      imports: [
        MatTabsModule,
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WsgAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
