import { CodingReportValidationProblemDto, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { VariableCodingData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { CodingSchemeProblem } from '@iqb/responses';
import { CodingReportClass } from './coding-report.class';

describe('CodingReportClass', () => {
  describe('build', () => {
    it('returns no rows for no units', () => {
      expect(CodingReportClass.build(1, [])).toEqual([]);
    });

    it('keeps activated no-value variables and alias chains free of breaking errors', () => {
      const units = [{
        id: 10,
        key: 'DLB007',
        name: '',
        schemer: 'schemer@2.8.1',
        variables: [
          { id: 'marking-panel_1', type: 'no-value' },
          { id: 'id04', type: 'string' },
          { id: '02', type: 'string' }
        ],
        metadata: { items: [] },
        scheme: JSON.stringify({
          version: '2.5',
          variableCodings: [{
            id: 'marking-panel_1',
            alias: '_08_reached',
            sourceType: 'BASE',
            sourceParameters: {
              processing: ['TAKE_DISPLAYED_AS_VALUE_CHANGED']
            },
            codes: [{
              id: 0,
              type: 'INTENDED_INCOMPLETE',
              score: 0,
              label: '',
              manualInstruction: '',
              ruleSetOperatorAnd: false,
              ruleSets: []
            }]
          }, {
            id: 'id04', alias: '02', sourceType: 'BASE', codes: []
          }, {
            id: '02', alias: '05', sourceType: 'BASE', codes: []
          }]
        })
      }] as unknown as UnitPropertiesDto[];

      const result = CodingReportClass.build(1, units);

      expect(result.find(row => row.variable === '_08_reached')?.validation)
        .toBe('OK');
      expect(result.every(row => row.validation !== 'Fehler')).toBe(true);
    });

    // A list stored in the VariableInfo 2.x spelling is read as such (#1708).
    it('reads variable types in the 2.x spelling', () => {
      const units = [{
        id: 11,
        key: 'VI2',
        name: '',
        schemer: 'schemer@2.8.1',
        variables: [
          { id: 'panel', type: 'NO_VALUE' },
          { id: 'count', type: 'NUMBER' }
        ],
        metadata: { items: [] },
        scheme: JSON.stringify({
          version: '2.5',
          variableCodings: [{
            id: 'panel', alias: 'panel', sourceType: 'BASE_NO_VALUE', codes: []
          }, {
            id: 'count',
            alias: 'count',
            sourceType: 'BASE',
            codes: [{
              id: 1,
              type: 'FULL_CREDIT',
              score: 1,
              label: '',
              manualInstruction: '',
              ruleSetOperatorAnd: false,
              ruleSets: [{ ruleOperatorAnd: false, rules: [{ method: 'NUMERIC_MATCH', parameters: ['1'] }] }]
            }]
          }]
        })
      }] as unknown as UnitPropertiesDto[];

      const result = CodingReportClass.build(1, units);

      expect(result.every(row => row.validation !== 'Fehler')).toBe(true);
    });

    // A scheme whose codes carry no rule sets of their own failed the whole report (#1873).
    it('reports a unit whose codes have no rule sets', () => {
      const units = [{
        id: 13,
        key: 'UNIT1',
        name: '',
        schemer: 'iqb-schemer@2.8',
        variables: [
          { id: 'auto_1', type: 'string' },
          { id: 'manual_1', type: 'string' }
        ],
        metadata: { items: [] },
        scheme: JSON.stringify({
          version: '3.0',
          variableCodings: [{
            id: 'auto_1',
            alias: 'auto_1',
            sourceType: 'BASE',
            ruleSets: [{
              ruleSetType: 'MATCH', ruleSetOperator: 'OR', ruleSetValue: 'a', rules: []
            }],
            codes: [
              {
                id: 1, score: 1, type: 'FULL_CREDIT', ruleSetIndex: 0, manualInstruction: ''
              },
              {
                id: 0, score: 0, type: 'RESIDUAL_AUTO', ruleSetIndex: null, manualInstruction: ''
              }
            ]
          }, {
            id: 'manual_1',
            alias: 'manual_1',
            sourceType: 'BASE',
            codes: [
              {
                id: 1, score: 1, type: 'FULL_CREDIT', ruleSetIndex: null, manualInstruction: '<p>Anweisung A</p>'
              },
              {
                id: 0, score: 0, type: 'NO_CREDIT', ruleSetIndex: null, manualInstruction: '<p>Anweisung B</p>'
              }
            ]
          }]
        })
      }] as unknown as UnitPropertiesDto[];

      const result = CodingReportClass.build(1, units);

      expect(result.map(row => [row.variable, row.codingType])).toEqual([
        ['auto_1', 'automatisch'],
        ['manual_1', 'manuell']
      ]);
    });

    it('reports a unit whose scheme cannot be used with one row', () => {
      const units = [{
        id: 12, key: 'OLD', name: 'Alt', schemer: 'schemer@1.4.0', scheme: '{}'
      }] as UnitPropertiesDto[];

      expect(CodingReportClass.build(3, units)).toEqual([{
        unit: '<a href=#/a/3/12>OLD: Alt</a>',
        variable: '',
        variableType: '',
        item: '',
        validation: 'Kodierschema mit Schemer Version ab 1.5 erzeugen!',
        validationProblems: [] as CodingReportValidationProblemDto[],
        codingType: '',
        trainingEffort: ''
      }]);
    });

    it.each([undefined, ''])('reports a unit with the scheme %p with one row', scheme => {
      const rows = CodingReportClass.build(3, [{
        id: 12, key: 'K', name: '', schemer: '', scheme
      }] as UnitPropertiesDto[]);

      expect(rows.map(row => row.validation)).toEqual(['Kodierschema mit Schemer Version ab 1.5 erzeugen!']);
    });

    // The JSON format of the scheme names no schemer.
    it('reads a scheme without a schemer, finding the item of a coding without alias by its id', () => {
      const units = [{
        id: 13,
        key: 'K',
        name: '',
        schemer: '',
        variables: [{ id: 'v1', type: 'string' }],
        metadata: { items: [{ id: 'I1', variableId: 'v1' }] },
        scheme: JSON.stringify({ version: '3.0', variableCodings: [{ id: 'v1', sourceType: 'BASE', codes: [] }] })
      }] as unknown as UnitPropertiesDto[];

      expect(CodingReportClass.build(3, units)).toEqual([
        expect.objectContaining({ variable: 'v1', item: 'I1' })
      ]);
    });
  });

  describe('coding report validation aggregation', () => {
    const codingVariable = {
      id: 'technical-id', alias: 'public-id'
    } as VariableCodingData;

    it('deduplicates and sorts all problems with breaking problems first', () => {
      const validationResults: CodingSchemeProblem[] = [{
        type: 'VACANT',
        breaking: false,
        variableId: 'public-id',
        variableLabel: ''
      }, {
        type: 'SOURCE_MISSING',
        breaking: true,
        variableId: 'public-id',
        variableLabel: '',
        code: '2'
      }, {
        type: 'SOURCE_MISSING',
        breaking: true,
        variableId: 'public-id',
        variableLabel: '',
        code: '2'
      }];

      const validationProblems = CodingReportClass.getValidationProblems(
        validationResults,
        codingVariable
      );

      expect(validationProblems).toEqual([{
        type: 'SOURCE_MISSING', breaking: true, code: '2'
      }, {
        type: 'VACANT', breaking: false
      }]);
      expect(
        CodingReportClass.getValidationStatus(validationProblems)
      ).toBe('Fehler');
    });

    it('finds the problems of a coding without alias by its id', () => {
      expect(CodingReportClass.getValidationProblems(
        [{
          type: 'VACANT', breaking: false, variableId: 'v1', variableLabel: ''
        }],
        { id: 'v1' } as VariableCodingData
      )).toEqual([{ type: 'VACANT', breaking: false }]);
    });

    it('sorts problems of the same weight by type, then by code', () => {
      const problem = (type: string, code: string) => ({
        type, breaking: false, variableId: 'public-id', variableLabel: '', code
      }) as CodingSchemeProblem;

      expect(CodingReportClass.getValidationProblems(
        [problem('VACANT', '1'), problem('SOURCE_MISSING', '2'), problem('SOURCE_MISSING', '1')],
        codingVariable
      ).map(({ type, code }) => `${type} ${code}`)).toEqual(['SOURCE_MISSING 1', 'SOURCE_MISSING 2', 'VACANT 1']);
    });

    it('reports warnings when no problem is breaking', () => {
      expect(CodingReportClass.getValidationStatus([{
        type: 'VACANT', breaking: false
      }])).toBe('Warnung');
      expect(CodingReportClass.getValidationStatus([])).toBe('OK');
    });
  });

  describe('determineCodingType', () => {
    it('maps closed coding to automatisch', () => {
      const codingType = CodingReportClass.determineCodingType({
        codes: [{
          type: 'RESIDUAL_AUTO',
          manualInstruction: '',
          ruleSets: [{ rules: [] }]
        }]
      } as unknown as VariableCodingData);

      expect(codingType).toBe('automatisch');
    });

    it('maps rules-based coding to halbautomatisch', () => {
      const codingType = CodingReportClass.determineCodingType({
        codes: [{
          manualInstruction: '',
          ruleSets: [{ rules: [{ method: 'MATCH', parameters: ['a'] }] }]
        }]
      } as unknown as VariableCodingData);

      expect(codingType).toBe('halbautomatisch');
    });

    it('maps manual coding to manuell', () => {
      const codingType = CodingReportClass.determineCodingType({
        codes: [{
          manualInstruction: 'Hinweis',
          ruleSets: [{ rules: [] }]
        }]
      } as unknown as VariableCodingData);

      expect(codingType).toBe('manuell');
    });

    it('maps codes without instruction and without rules to keine Regeln', () => {
      const codingType = CodingReportClass.determineCodingType({
        codes: [{
          type: 'FULL_CREDIT',
          manualInstruction: '',
          ruleSets: [{ rules: [] }]
        }]
      } as unknown as VariableCodingData);

      expect(codingType).toBe('keine Regeln');
    });

    // Codes without rule sets or manual instruction, both optional in the spec (#1873).
    it('maps manual codes without rule sets to manuell', () => {
      const codingType = CodingReportClass.determineCodingType({
        id: 'v',
        sourceType: 'BASE',
        codes: [{ id: 1, type: 'FULL_CREDIT', manualInstruction: '<p>Anweisung A</p>' },
          { id: 0, type: 'NO_CREDIT', manualInstruction: '<p>Anweisung B</p>' }]
      });

      expect(codingType).toBe('manuell');
    });

    it('maps closed codes without rule sets to automatisch', () => {
      const codingType = CodingReportClass.determineCodingType({
        id: 'v',
        sourceType: 'BASE',
        codes: [{ id: 1, type: 'FULL_CREDIT', manualInstruction: '' },
          { id: 0, type: 'RESIDUAL_AUTO', manualInstruction: '' }]
      });

      expect(codingType).toBe('automatisch');
    });

    it('maps codes without rule sets and manual instruction to keine Regeln', () => {
      const codingType = CodingReportClass.determineCodingType({
        id: 'v',
        sourceType: 'BASE',
        codes: [{ id: 1, type: 'FULL_CREDIT' }]
      });

      expect(codingType).toBe('keine Regeln');
    });
  });

  describe('determineVariableType', () => {
    it('maps base variables to Basisvariable', () => {
      const variableType = CodingReportClass.determineVariableType({
        sourceType: 'BASE'
      } as unknown as VariableCodingData);

      expect(variableType).toBe('Basisvariable');
    });

    it('maps derived variables to abgeleitete Variable', () => {
      const variableType = CodingReportClass.determineVariableType({
        sourceType: 'SUM_SCORE'
      } as unknown as VariableCodingData);

      expect(variableType).toBe('abgeleitete Variable');
    });
  });

  describe('determineTrainingEffort', () => {
    it('returns erhöht when CODER_TRAINING_REQUIRED is set', () => {
      const trainingEffort = CodingReportClass.determineTrainingEffort({
        processing: ['CODER_TRAINING_REQUIRED']
      } as unknown as VariableCodingData);

      expect(trainingEffort).toBe('erhöht');
    });

    it('returns normal when CODER_TRAINING_REQUIRED is not set', () => {
      const trainingEffort = CodingReportClass.determineTrainingEffort({
        processing: []
      } as unknown as VariableCodingData);

      expect(trainingEffort).toBe('normal');
    });
  });
});
