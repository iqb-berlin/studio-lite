import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CodeData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { UnitPrintCodeComponent } from './unit-print-code.component';

describe('UnitPrintCodeComponent', () => {
  let component: UnitPrintCodeComponent;
  let fixture: ComponentFixture<UnitPrintCodeComponent>;

  const createMockCodeData = (overrides?: Partial<CodeData>): CodeData => ({
    id: 1,
    label: 'Test Code',
    score: 10,
    manualInstruction: 'Test manual instruction',
    ruleSets: [],
    ruleSetOperatorAnd: true,
    type: 'RESIDUAL_AUTO',
    ...overrides
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UnitPrintCodeComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPrintCodeComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnChanges', () => {
    it('should not update if codeData change has no currentValue', () => {
      const previousCodeAsText = component.codeAsText;

      component.ngOnChanges({
        codeData: new SimpleChange(null, null, false)
      });

      expect(component.codeAsText).toBe(previousCodeAsText);
    });

    it('should not process changes if codeData is not in changes', () => {
      const previousCodeAsText = component.codeAsText;

      component.ngOnChanges({
        otherProperty: new SimpleChange(null, 'value', false)
      });

      expect(component.codeAsText).toBe(previousCodeAsText);
    });
  });

  describe('generateRulesDescription', () => {
    it('should generate description with UND operator for multiple rule sets', () => {
      const mockCodeData = createMockCodeData({
        ruleSets: [
          {
            rules: [],
            ruleOperatorAnd: true
          },
          {
            rules: [],
            ruleOperatorAnd: true
          }
        ],
        ruleSetOperatorAnd: true
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText.description).toContain('UND');
    });

    it('should generate description with ODER operator for multiple rule sets', () => {
      const mockCodeData = createMockCodeData({
        ruleSets: [
          {
            rules: [],
            ruleOperatorAnd: true
          },
          {
            rules: [],
            ruleOperatorAnd: true
          }
        ],
        ruleSetOperatorAnd: false
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText.description).toContain('ODER');
    });

    it('should not add operator description for single rule set', () => {
      const mockCodeData = createMockCodeData({
        ruleSets: [
          {
            rules: [],
            ruleOperatorAnd: true
          }
        ]
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText.description).not.toContain('UND');
      expect(component.codeAsText.description).not.toContain('ODER');
    });
  });
});
