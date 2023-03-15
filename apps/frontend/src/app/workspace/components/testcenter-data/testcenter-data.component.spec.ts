import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { TestcenterDataComponent } from './testcenter-data.component';
import { environment } from '../../../../environments/environment';

describe('TestcenterDataComponent', () => {
  let component: TestcenterDataComponent;
  let fixture: ComponentFixture<TestcenterDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestcenterDataComponent],
      imports: [
        NoopAnimationsModule,
        MatSelectModule,
        MatInputModule,
        FormsModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatDialogModule,
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(TestcenterDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
