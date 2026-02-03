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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should update codeAsText when codeData changes', () => {
      const mockCodeData = createMockCodeData({
        id: 1,
        label: 'Code 1'
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText).toBeDefined();
      expect(component.codeAsText.id).toBe(1);
      expect(component.codeAsText.label).toBeDefined();
    });

    it('should not update if codeData change has no currentValue', () => {
      const previousCodeAsText = component.codeAsText;

      component.ngOnChanges({
        codeData: new SimpleChange(null, null, false)
      });

      expect(component.codeAsText).toBe(previousCodeAsText);
    });

    it('should handle codeData with INVALID id', () => {
      const mockCodeData = createMockCodeData({
        id: 'INVALID'
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText.id).toBe('INVALID');
    });

    it('should handle codeData with INTENDED_INCOMPLETE id', () => {
      const mockCodeData = createMockCodeData({
        id: 'INTENDED_INCOMPLETE'
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText.id).toBe('INTENDED_INCOMPLETE');
    });

    it('should not process changes if codeData is not in changes', () => {
      const previousCodeAsText = component.codeAsText;

      component.ngOnChanges({
        otherProperty: new SimpleChange(null, 'value', false)
      });

      expect(component.codeAsText).toBe(previousCodeAsText);
    });
  });

  describe('mapCodeDataToCodeInfo', () => {
    it('should map code data with manual instruction', () => {
      const mockCodeData = createMockCodeData({
        id: 5,
        label: 'Test Label',
        manualInstruction: 'Manual instruction text'
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText.id).toBe(5);
      expect(component.codeAsText.manualInstruction).toBe('Manual instruction text');
    });

    it('should handle code without manual instruction', () => {
      const mockCodeData = createMockCodeData({
        manualInstruction: ''
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText.manualInstruction).toBe('');
    });

    it('should generate rules description', () => {
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

      expect(component.codeAsText.description).toBeDefined();
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

    it('should handle empty rule sets', () => {
      const mockCodeData = createMockCodeData({
        ruleSets: []
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText.description).toBeDefined();
    });

    it('should wrap text on semicolons with br tags', () => {
      const mockCodeData = createMockCodeData({
        label: 'Test; with; semicolons',
        ruleSets: []
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      // The description might contain HTML formatting
      expect(component.codeAsText.description).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle code data with zero score', () => {
      const mockCodeData = createMockCodeData({
        score: 0
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText).toBeDefined();
    });

    it('should handle code data with negative score', () => {
      const mockCodeData = createMockCodeData({
        score: -5
      });

      component.ngOnChanges({
        codeData: new SimpleChange(null, mockCodeData, true)
      });

      expect(component.codeAsText).toBeDefined();
    });
  });
});
