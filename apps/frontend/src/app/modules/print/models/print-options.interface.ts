export type PrintOption = 'printProperties' | 'printMetadata' | 'printComments' |
'printCoding' | 'printPreview' | 'printPreviewAutoHeight' | 'printPreviewHeight' | 'printElementIds' |
'printLandscape';

export interface PrintOptions {
  key: PrintOption;
  value: boolean | number;
}
