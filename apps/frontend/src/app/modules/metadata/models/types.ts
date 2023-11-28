// eslint-disable-next-line max-classes-per-file
export type NotationNode = {
  id: string,
  notation: string[],
  description?: string,
  label?: string,
  level?: number,
  checked?: boolean,
  name?: string,
  indeterminate?: boolean,
  children?: NotationNode[] | [],
  prefLabel?: {
    de: string
  },
  parent?: NotationNode,
  selected?: boolean,
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
  title: { de: string },
  hasTopConcept: Array<NotationNode>,
};

export type DialogData = {
  vocab: Vocabulary,
  value: VocabFlatNode[],
  props: NestedTreeParameters,
  vocabularies: Array<{ url: string, data: Vocabulary }>
};

export class VocabNode {
  children!: VocabNode[];
  id!: string;
  label!: string;
  notation!: string;
}

/** Flat to-do item node with expandable and level information */
export class VocabFlatNode {
  id!: string;
  label!: string;
  notation!: string;
  level!: number;
  expandable!: boolean;
}
