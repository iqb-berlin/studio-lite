import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ItemSortService {
  itemSortings: string[] = ['id', 'variableId'];
  currenItemSorting: string = 'id';
}
