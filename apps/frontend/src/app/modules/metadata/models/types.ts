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
  notation:string,
  description:string,
  label?:string,
  level:number,
  name:string,
  indeterminate?:boolean,
  children?: NotationNode[] | [],
  url?:string,
  prefLabel?:{
    de:string
  },
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

export type DialogData = {
  vocab: any,
  value: any,
  selectedNodes: SelectedNode[],
  props: NestedTreeParameters,
  vocabularies:any
};
