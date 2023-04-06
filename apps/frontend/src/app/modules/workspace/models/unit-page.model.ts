export type PagingMode = 'separate' | 'concat-scroll' | 'concat-scroll-snap';

export interface PageData {
  index: number;
  id: string;
  type: '#next' | '#previous' | '#goto';
  disabled: boolean;
}

export interface StatusVisual {
  id: string;
  label: string;
  color: string;
  description: string;
}
