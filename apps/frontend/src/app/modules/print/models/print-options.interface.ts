export type PrintOption = 'printProperties' | 'printMetadata' | 'printComments' |
'printCoding' | 'printPreview';

export interface PrintOptions {
  key: PrintOption;
  value: boolean;
}
