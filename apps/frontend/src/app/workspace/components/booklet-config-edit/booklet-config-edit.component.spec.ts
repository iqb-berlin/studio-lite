import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BookletConfigEditComponent } from './booklet-config-edit.component';

describe('ReviewConfigEditComponent', () => {
  let component: BookletConfigEditComponent;
  let fixture: ComponentFixture<BookletConfigEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookletConfigEditComponent],
      imports: [
        FormsModule,
        MatSelectModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookletConfigEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});