import {
  Component, Inject, OnInit
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import {
  CodeData, CodingRule, CodingScheme, CodingSchemeProblem, RuleSet, VariableCodingData
} from '@iqb/responses';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgForOf, NgIf } from '@angular/common';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';

export type UnitDataRow = {
  Aufgabe: string | undefined,
  Variable: string,
  Item: string,
  Validierung: string,
  Kodiertyp: string,
};

@Component({
  selector: 'coding-report',
  templateUrl: './coding-report.component.html',
  styleUrls: ['coding-report.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatTabsModule,
    NgForOf,
    MatSortModule,
    MatProgressSpinnerModule,
    NgIf]
})

export class CodingReportComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[] },
    public workspaceService: WorkspaceService,
    public backendService: BackendService
  ) {
  }

  displayedColumns: string[] = ['Aufgabe', 'Variable', 'Item', 'Validierung', 'Kodiertyp'];
  tableData: Record<string, string | undefined>[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.isLoading = true;
    this.backendService.getUnitListWithMetadata(this.workspaceService.selectedWorkspaceId)
      .subscribe((unitListWithMetadata: UnitMetadataDto[]) => {
        if (unitListWithMetadata !== null) {
          unitListWithMetadata?.forEach((unit: UnitMetadataDto) => {
            const unitDataRows: UnitDataRow[] = [];
            const parsedUnitScheme = JSON.parse(unit.scheme as string);
            if (parsedUnitScheme) {
              const schemer = new CodingScheme(parsedUnitScheme.variableCodings);
              const validation = schemer.validate(unit.variables);
              let validationResultText :string;
              parsedUnitScheme.variableCodings.forEach((codingVariable:VariableCodingData, varIndex:number) => {
                const validationResult = validation
                  .find((v: CodingSchemeProblem) => v.variableId === codingVariable.id);
                if (validationResult) {
                  if (validationResult.breaking) {
                    validationResultText = 'Fehler';
                  } else validationResultText = 'Warnung';
                } else {
                  validationResultText = 'OK';
                }
                const foundItem = unit.metadata.items?.find((item: any) => item.variableId === codingVariable.id);
                let closedCoding = false;
                let manualCodingOnly = false;
                let hasRules = false;
                if (codingVariable.codes?.length > 0) {
                  codingVariable.codes.forEach((code: CodeData) => {
                    const hasManualInstruction = code.manualInstruction.length > 0;
                    code.ruleSets.forEach((ruleSet: RuleSet) => {
                      if (hasManualInstruction && ruleSet.rules.length === 0) manualCodingOnly = true;
                      hasRules = ruleSet.rules.length > 0;
                      ruleSet.rules.forEach((rule:CodingRule) => {
                        if (rule.method === 'ELSE') {
                          closedCoding = true;
                        }
                      });
                    });
                  });
                }
                let codingType;
                if (closedCoding) {
                  codingType = 'geschlossen';
                } else if (manualCodingOnly) {
                  codingType = 'manuell';
                } else if (hasRules) {
                  codingType = 'regelbasiert';
                } else {
                  codingType = 'keine Regeln';
                }
                unitDataRows.push({
                  Aufgabe: varIndex < 1 ? `${unit.key}${unit.name ? ':' : ''}${unit.name}` : ' ' || '-',
                  Variable: codingVariable.id || '–',
                  Item: foundItem?.id || '–',
                  Validierung: validationResultText,
                  Kodiertyp: codingType
                });
              });
            }
            this.tableData = [...this.tableData, ...unitDataRows];
          });
        }
        this.isLoading = false;
      });
  }
}
