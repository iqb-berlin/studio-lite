export interface ActiveComment {
  id: number;
  type: ActiveCommentType;
}

export enum ActiveCommentType {
  replying = 'replying',
  editing = 'editing'
}
