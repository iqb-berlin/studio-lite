export type PrintOption = 'printProperties' | 'printComments' |
'printCoding' | 'printPreview';

export interface PrintOptions {
  key: PrintOption;
  value: boolean;
}
