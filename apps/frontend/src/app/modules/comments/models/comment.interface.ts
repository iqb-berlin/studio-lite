export interface Comment {
  id: number;
  body: string;
  userName: string;
  itemUuids: string[];
  userId: number;
  unitId: number;
  hidden: boolean;
  parentId: number | null;
  createdAt: Date;
  changedAt: Date;
}
