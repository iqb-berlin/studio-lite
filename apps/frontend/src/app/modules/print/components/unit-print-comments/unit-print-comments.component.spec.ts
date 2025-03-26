import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { UnitPrintCommentsComponent } from './unit-print-comments.component';
import { CommentsModule } from '../../../comments/comments.module';
import { environment } from '../../../../../environments/environment';

describe('UnitPrintCommentsComponent', () => {
  let component: UnitPrintCommentsComponent;
  let fixture: ComponentFixture<UnitPrintCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CommentsModule
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPrintCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
