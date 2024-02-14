import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UnitPrintCodeComponent } from './unit-print-code.component';

describe('UnitPrintCodeComponent', () => {
  let component: UnitPrintCodeComponent;
  let fixture: ComponentFixture<UnitPrintCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitPrintCodeComponent],
      imports: [
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPrintCodeComponent);
    component = fixture.componentInstance;
    component.codeData = {
      id: 1, label: 'test', score: 0, manualInstruction: '', ruleSets: [], ruleSetOperatorAnd: true
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
