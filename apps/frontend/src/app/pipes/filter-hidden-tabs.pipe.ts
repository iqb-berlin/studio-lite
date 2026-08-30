import { Pipe, PipeTransform } from '@angular/core';

/**
 * The tabs left after the routes a workspace hides are taken out. A pure pipe rather than a method
 * in the template, so the filtering does not run on every change-detection cycle.
 */
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
