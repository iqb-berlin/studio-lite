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

    // With a manual instruction the hint that a rule set has no rules is left out (#1974). With more
    // than one rule set the hint carries a prefix and is still printed (#1975).
    it.each([
      ['', 'Keine Regeln definiert.'],
      ['<p>Bitte von Hand kodieren.</p>', '']
    ])('should state an empty rule set for manual instruction %j as %j', (manualInstruction, description) => {
      const mockCodeData = createMockCodeData({
        type: 'FULL_CREDIT',
        manualInstruction,
        ruleSets: [{ rules: [], ruleOperatorAnd: true }]
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText.description.replace(/<[^>]+>/g, '')).toBe(description);
    });

    // Split at every semicolon, also inside a value (#1975).
    it('should put each rule of a rule set on a line of its own', () => {
      const mockCodeData = createMockCodeData({
        type: 'FULL_CREDIT',
        ruleSets: [{
          ruleOperatorAnd: true,
          rules: [{ method: 'MATCH', parameters: ['a'] }, { method: 'MATCH', parameters: ['b'] }]
        }]
      });
      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });
      fixture.detectChanges();

      const lines = fixture.nativeElement.querySelectorAll('.rule-line');
      expect(lines.length).toBe(2);
      expect(lines[0].textContent).toContain("'a'");
      expect(lines[1].textContent).toContain("'b'");
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
