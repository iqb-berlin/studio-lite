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

  describe('rules', () => {
    const show = (overrides: Partial<CodeData>): HTMLElement => {
      const code = createMockCodeData({ type: 'FULL_CREDIT', manualInstruction: '', ...overrides });
      component.ngOnChanges({ codeData: new SimpleChange(null, code, true) });
      fixture.detectChanges();
      return fixture.nativeElement;
    };
    const ruleSet = (...values: string[]) => ({
      ruleOperatorAnd: true,
      rules: values.map(value => ({ method: 'MATCH' as const, parameters: [value] }))
    });
    const blockTexts = (element: HTMLElement): (string | undefined)[] => Array
      .from(element.querySelectorAll('.rule-block'))
      .map(block => block.textContent?.trim());

    // Which rule sets are printed and how they are split, ruleBlocks decides (#1974, #1975).
    it('should print each rule of a rule set on a line of its own', () => {
      const lines = show({ ruleSets: [ruleSet('a', 'b')] }).querySelectorAll('.rule-line');

      expect(lines.length).toBe(2);
      expect(lines[0].textContent).toContain("'a'");
      expect(lines[1].textContent).toContain("'b'");
    });

    // Coded by hand without any rule, there is nothing to join either.
    it('should print neither rules nor their joining for a code coded by hand', () => {
      const element = show({
        manualInstruction: '<p>Bitte von Hand kodieren.</p>',
        ruleSetOperatorAnd: true,
        ruleSets: [ruleSet(), ruleSet()]
      });

      expect(blockTexts(element)).toEqual([]);
    });

    // Printed as HTML, a value such as <b> was taken for markup and vanished (#1975).
    it('should print a value as text', () => {
      const line = show({ ruleSets: [ruleSet('<b>fett</b>')] }).querySelector('.rule-line');

      expect(line?.textContent).toContain("'<b>fett</b>'");
      expect(line?.querySelector('b')).toBeNull();
    });

    it.each([
      [true, 'print.rule-sets-and'],
      [false, 'print.rule-sets-or']
    ])('should join two rule sets with operator AND %s as %s', (ruleSetOperatorAnd, joining) => {
      const element = show({ ruleSetOperatorAnd, ruleSets: [ruleSet('a'), ruleSet('b')] });

      expect(blockTexts(element).pop()).toBe(joining);
    });

    it('should not join a single rule set', () => {
      const element = show({ ruleSets: [ruleSet('a')] });

      expect(blockTexts(element).length).toBe(1);
    });
  });
});
