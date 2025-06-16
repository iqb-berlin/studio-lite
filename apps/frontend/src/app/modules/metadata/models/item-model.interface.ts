export interface ItemModel {
  id?: string;
  variableId?: string | null;
  variableReadOnlyId?: string | null;
  description?: string;
  weighting?: number;
  [key: string]: string | number | null | undefined;
}
