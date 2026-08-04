import { Pipe, PipeTransform } from '@angular/core';
import { toW3idProfileId } from '@studio-lite/shared-code';

/**
 * Whether a registry profile is part of a group's selection. Both sides are
 * reduced to the canonical w3id spelling first, so a selection stored in the
 * retired github form still matches the profile the registry lists (#1570).
 *
 * A pure pipe rather than a method bound in the template: it is only
 * re-evaluated when the profile id or the selection changes by reference,
 * instead of on every change-detection cycle for every checkbox.
 */
@Pipe({
  name: 'isProfileSelected',
  standalone: true
})
export class IsProfileSelectedPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(id: string | undefined, selected: { id: string }[] | undefined): boolean {
    if (!id || !selected?.length) return false;
    const canonicalId = toW3idProfileId(id);
    return selected.some(profile => toW3idProfileId(profile.id) === canonicalId);
  }
}
