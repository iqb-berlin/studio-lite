import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { CodeData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { TranslateModule } from '@ngx-translate/core';
import { ToTextFactory } from '@iqb/responses';
import { ruleBlocks } from '../../../../utils/rule-blocks.utils';

interface CodeInfo {
  id: number | 'INVALID' | 'INTENDED_INCOMPLETE';
  label: string;
  // A block per printed rule set, a line per rule; rendered as text, so a value is never read as markup.
  ruleBlocks: string[][];
  // How the printed rule sets are joined, as a translation key; null where there are fewer than two.
  ruleSetJoining: 'print.rule-sets-and' | 'print.rule-sets-or' | null;
  manualInstruction?: string;
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
    const code: CodeData | undefined = changes[codeData]?.currentValue;

    if (code) {
      const codeAsText = ToTextFactory.codeAsText(code, 'EXTENDED');
      const blocks = ruleBlocks(code, codeAsText);
      const joining = code.ruleSetOperatorAnd ? 'print.rule-sets-and' : 'print.rule-sets-or';
      this.codeAsText = {
        id: code.id,
        label: codeAsText.label,
        ruleBlocks: blocks,
        ruleSetJoining: blocks.length > 1 ? joining : null,
        manualInstruction: code.manualInstruction
      };
    }
  }
}
