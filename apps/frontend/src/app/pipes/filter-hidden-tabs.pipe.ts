import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterHiddenTabs',
  standalone: true,
  pure: true
})
export class FilterHiddenTabsPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(
    tabs: { name: string; duplicable: boolean }[] | undefined,
    hiddenRoutes: string[] | undefined
  ): { name: string; duplicable: boolean }[] {
    if (!tabs) return [];
    if (!hiddenRoutes) return tabs;
    return tabs.filter(tab => !hiddenRoutes.includes(tab.name));
  }
}
