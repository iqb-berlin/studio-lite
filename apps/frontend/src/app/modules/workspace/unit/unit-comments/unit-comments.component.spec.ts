import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { UnitCommentsComponent } from './unit-comments.component';
import { environment } from '../../../../../environments/environment';

describe('UnitCommentsComponent', () => {
  let component: UnitCommentsComponent;
  let fixture: ComponentFixture<UnitCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitCommentsComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
