export interface ItemModel {
  id?: string;
  variableId?: string | null;
  variableReadOnlyId?: string | null;
  description?: string;
  [key: string]: string | number | null | undefined;
}
