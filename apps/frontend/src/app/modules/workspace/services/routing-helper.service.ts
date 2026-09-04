import { Injectable } from '@angular/core';
import { DefaultUrlSerializer } from '@angular/router';

/**
 * Reads which route is showing in a named outlet nested inside another. The workspace puts its
 * views into secondary outlets, and what is open there cannot be read off the activated route --
 * so the URL is parsed for it.
 */
@Injectable({
  providedIn: 'root'
})
export class RoutingHelperService {
  static getSecondaryOutlet(url: string,
                            primaryRoutingOutlet: string,
                            secondaryRoutingOutlet: string): string | null {
    const serializer = new DefaultUrlSerializer();
    const urlTree = serializer.parse(url);
    return urlTree
      .root.children[primaryRoutingOutlet]?.children[secondaryRoutingOutlet]?.segments[0]?.path || null;
  }
}
