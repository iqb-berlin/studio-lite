export type SelectedNode = {
  id: string,
  notation:string,
  label:string,
  description:string,
  indeterminate?:boolean,
  children?:NotationNode[] | [],
};

export type NotationNode = {
  id: string,
  notation:string[],
  description?:string,
  label?:string,
  level?:number,
  name?:string,
  indeterminate?:boolean,
  children?: NotationNode[] | [],
  prefLabel?:{
    de:string
  },
  parent?:NotationNode,
  selected:boolean,
  narrower?: NotationNode[]
};

export type NestedTreeParameters = {
  url: string,
  allowMultipleValues: boolean,
  maxLevel: number,
  hideNumbering: boolean,
  hideDescription: boolean,
  hideTitle: boolean,
  addTextLanguages: Array<string>
};

export type Vocabulary = {
  id: string,
  type: string,
  title: { de:string },
  hasTopConcept: Array<NotationNode>,
};

export type DialogData = {
  vocab: Vocabulary,
  value: NotationNode[],
  selectedNodes: SelectedNode[],
  props: NestedTreeParameters,
  vocabularies: Array< { url:string, data:Vocabulary }>
};
