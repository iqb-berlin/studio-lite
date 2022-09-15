export class VeronaVariable {
  id = '##xx##';
  type: 'integer' | 'number' | 'boolean' | 'string' | 'attachment' = 'string';
  format: 'text-selection' | 'image' | 'capture-image' | 'audio' | 'ggb-file' | 'non-negative' | '' = '';
  nullable = false;
  multiple = false;
  values: string[] = [];
  valuesComplete = false;
  unknownKeys: string[] = [];

  constructor(variableData: unknown) {
    const transformedData = variableData as Record<string, never>;
    Object.keys(transformedData).forEach(k => {
      switch (k) {
        case 'id':
          this.id = transformedData['id'];
          break;
        case 'type':
          this.type = transformedData['type'];
          break;
        case 'format':
          this.format = transformedData['format'] === 'coloredSelectionRange' ?
            'text-selection' : transformedData['format'];
          break;
        case 'nullable':
          this.nullable = transformedData['nullable'];
          break;
        case 'multiple':
          this.multiple = transformedData['multiple'];
          break;
        case 'valuesComplete':
          this.valuesComplete = transformedData['valuesComplete'];
          break;
        case 'values':
          this.values = (transformedData['values'] as string[]).map(s => s);
          break;
        default:
          this.unknownKeys.push(k);
      }
    });
  }
}
