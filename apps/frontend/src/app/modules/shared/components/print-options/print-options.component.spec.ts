import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PrintOptionsComponent } from './print-options.component';

describe('PrintOptionsComponent', () => {
  let component: PrintOptionsComponent;
  let fixture: ComponentFixture<PrintOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrintOptionsComponent],
      imports: [
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
