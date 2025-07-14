export interface Comment {
  id: number;
  body: string;
  userName: string;
  itemUuids: string[];
  userId: number;
  unitId: number;
  parentId: number | null;
  createdAt: Date;
  changedAt: Date;
}
