export interface Comment {
  id: number;
  body: string;
  userName: string;
  userId: number;
  parentId: number | null;
  createdAt: string;
}
