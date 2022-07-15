export interface Comment {
  id: number;
  body: string;
  userName: string;
  userId: number;
  unitId: number;
  parentId: number | null;
  createdAt: string;
}
