export interface ConfirmDialogData {
  title: string;
  content: string;
  confirmButtonLabel: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  confirmButtonReturn: any;
  confirmButton2Label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  confirmButton2Return: any;
  /** shows the content as a warning; saving may still be offered (#2127) */
  warning: boolean;
  confirmButtonDisabled: boolean;
}
