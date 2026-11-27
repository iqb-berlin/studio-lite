import { Pipe, PipeTransform } from '@angular/core';

/** The routes of a workspace that its settings can hide, in the order the settings dialog lists them. */
export const HIDEABLE_ROUTES = ['metadata', 'editor', 'preview', 'schemer', 'comments', 'notes'];

/**
 * The routes a workspace hides, in the order of {@link HIDEABLE_ROUTES} rather than the order they were
 * switched off in, so that the tables of the admin pages list them alike in every row. A value that is no
 * such route is left out, as the tables showed only these routes before (#2251).
 */
@Pipe({
  name: 'orderedHiddenRoutes',
  standalone: true,
  pure: true
})
export class OrderedHiddenRoutesPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(hiddenRoutes: string[] | undefined): string[] {
    if (!hiddenRoutes) return [];
    return HIDEABLE_ROUTES.filter(route => hiddenRoutes.includes(route));
  }
}
