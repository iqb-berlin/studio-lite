import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { CodeData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { TranslateModule } from '@ngx-translate/core';
import { CodeAsText, ToTextFactory } from '@iqb/responses';

interface CodeInfo {
  id: number | 'INVALID' | 'INTENDED_INCOMPLETE';
  label: string;
  description: string;
  manualInstruction?: string;
  ruleSetDescriptions?: string[];
}

@Component({
  selector: 'studio-lite-unit-print-code',
  templateUrl: './unit-print-code.component.html',
  styleUrls: ['./unit-print-code.component.scss'],
  imports: [TranslateModule]
})
export class UnitPrintCodeComponent implements OnChanges {
  @Input() codeData!: CodeData;

  codeAsText!: CodeInfo;

  ngOnChanges(changes: SimpleChanges): void {
    const codeData = 'codeData';
    const updatedCodeData = changes[codeData].currentValue;

    if (updatedCodeData) {
      this.codeAsText = this.mapCodeDataToCodeInfo(updatedCodeData);
    }
  }

  private mapCodeDataToCodeInfo(code: CodeData): CodeInfo {
    const codeAsText = ToTextFactory.codeAsText(code, 'EXTENDED');
    const rulesDescription = this.generateRulesDescription(codeAsText, code);

    // Map the properties into the CodeInfo structure
    return {
      id: code.id,
      label: codeAsText.label,
      description: rulesDescription,
      manualInstruction: code.manualInstruction,
      ruleSetDescriptions: codeAsText.ruleSetDescriptions
    };
  }

  /**
   * Generates HTML-formatted rules descriptions based on the given CodeAsText and CodeData.
   * Each wrapped text will include additional padding.
   * @param codeAsText - Represents a textual conversion of CodeData.
   * @param code - Full CodeData object for calculation of rule descriptions.
   * @returns The rules description in a HTML string format.
   */
  // eslint-disable-next-line class-methods-use-this
  private generateRulesDescription(codeAsText: CodeAsText, code: CodeData): string {
    let rulesDescription = '';

    // Iterate over defined rule set descriptions
    codeAsText.ruleSetDescriptions.forEach((ruleSetDescription: string) => {
      if (
        ruleSetDescription !== 'Keine Regeln definiert.' ||
        (ruleSetDescription === 'Keine Regeln definiert.' && !code.manualInstruction)
      ) {
        // Check if the ruleSetDescription contains a semicolon
        if (ruleSetDescription.includes(';')) {
          // Split on semicolons and wrap to the next line with padding
          const wrappedText = ruleSetDescription
            .split(';')
            .map(
              linePart => `
              <span class="rule-line">${linePart.trim()}</span>`
            )
            .join('<br />');
          rulesDescription += `<p class="rule-block">${wrappedText}</p>`;
        } else {
          rulesDescription += `<p class="rule-block">${ruleSetDescription}</p>`;
        }
      }
    });

    // Add logical operator description if there are multiple rule sets
    if (code.ruleSets.length > 1) {
      const operator = code.ruleSetOperatorAnd ? 'UND' : 'ODER';
      rulesDescription += `<p class="rule-block">Verknüpfung der Regelsätze: ${operator}</p>`;
    }
    return rulesDescription;
  }
}
