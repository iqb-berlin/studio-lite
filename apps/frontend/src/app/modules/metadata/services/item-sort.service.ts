import { Injectable } from '@angular/core';

/**
 * By which field the items are ordered -- their own id or the variable they belong to. Chosen in
 * one place and read in several, which is why it is a service and not a component's field.
 */
@Injectable({
  providedIn: 'root'
})

export class ItemSortService {
  itemSortings: string[] = ['id', 'variableId'];
  currenItemSorting: string = 'id';
}
