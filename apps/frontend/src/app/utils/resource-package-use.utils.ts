import { ResourcePackageUse } from '@studio-lite/shared-code';

/** A text to translate, with the values it names. */
export interface ResourcePackageUseText {
  key: string;
  params: Record<string, string>;
}

/**
 * Why a resource package is in use, each reason with the step that frees it (#1358): what the
 * administrator reads before deleting or renaming it, rather than the bare refusal of the API.
 */
export function resourcePackageUseTexts(use: ResourcePackageUse, packageName: string): ResourcePackageUseText[] {
  const params = { packageName };
  return [
    ...(use.isDefault ? [{ key: 'resource-packages.use-default', params }] : []),
    ...(use.servesByName ? [{ key: 'resource-packages.use-by-name', params }] : []),
    ...(use.groups.length ? [{
      key: 'resource-packages.use-groups',
      params: { groups: use.groups.map(group => group.name).join(', ') }
    }] : [])
  ];
}
