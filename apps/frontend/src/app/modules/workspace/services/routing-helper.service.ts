import { Injectable } from '@angular/core';
import { DefaultUrlSerializer } from '@angular/router';

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
