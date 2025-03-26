import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Pipe, PipeTransform } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PrintOptionsComponent } from './print-options.component';

describe('PrintOptionsComponent', () => {
  let component: PrintOptionsComponent;
  let fixture: ComponentFixture<PrintOptionsComponent>;

  @Pipe({ name: 'isActivePrintOption', standalone: false })
  class MockIsActivePrintOptionPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform() {
      return false;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockIsActivePrintOptionPipe
      ],
      imports: [
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        FormsModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
