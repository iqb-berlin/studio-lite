export interface ActiveCommentInterface {
  id: number;
  type: ActiveCommentType;
}

export enum ActiveCommentType {
  replying = 'replying',
  editing = 'editing'
}
