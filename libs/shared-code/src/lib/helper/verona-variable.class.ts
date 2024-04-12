import { VariableValue } from '@iqb/responses/coding-interfaces';

export class VeronaVariable {
  id = '##xx##';
  type: 'integer' | 'number' | 'boolean' | 'string' | 'attachment' = 'string';
  format: 'text-selection' | 'image' | 'capture-image' | 'audio' | 'ggb-file' | 'non-negative' | '' = '';
  nullable = false;
  multiple = false;
  values: VariableValue[] = [];
  valuesComplete = false;
  valuePositionLabels: string[] = [];
  page: string = '';
  //unknownKeys: string[] = [];

  constructor(variableData: unknown) {
    console.log('variableData', variableData);
    const transformedData = variableData as Record<string, never>;
    Object.keys(transformedData).forEach(k => {
      switch (k) {
        case 'id':
          this.id = transformedData[k];
          break;
        case 'type':
          this.type = transformedData[k];
          break;
        case 'format':
          this.format = transformedData[k];
            //'text-selection' : transformedData[k];
          break;
        case 'nullable':
          this.nullable = transformedData[k];
          break;
        case 'multiple':
          this.multiple = transformedData[k];
          break;
        case 'valuesComplete':
          this.valuesComplete = transformedData[k];
          break;
        case 'values':
          this.values = transformedData[k]; //(transformedData[k] as string[]).map(s => s);
          break;
        case 'page':
          this.page = transformedData[k];
          break;
        case 'valuePositionLabels':
          this.valuePositionLabels = transformedData[k];
          break;
        default:
          //this.unknownKeys.push(k);
      }
    });
  }
}
