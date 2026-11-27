import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouteReuseStrategy, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AreaRouteReuseStrategy } from './area-route-reuse-strategy.class';

@Component({ template: '' })
class PageComponent {}

describe('AreaRouteReuseStrategy', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    const routes: Routes = [
      // an area, as the workspace is entered: its module is loaded, and the id is a parameter of that route
      { path: 'a/:ws', loadChildren: () => Promise.resolve([{ path: ':u', component: PageComponent }]) },
      { path: 'home/:login', component: PageComponent }
    ];
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: RouteReuseStrategy, useClass: AreaRouteReuseStrategy }
      ]
    });
    harness = await RouterTestingHarness.create();
  });

  // #2242: a unit of another workspace, its address pasted into the open studio, was looked for in the one before
  it('should build an area anew for another id', async () => {
    const before = await harness.navigateByUrl('/a/1/5', PageComponent);

    const after = await harness.navigateByUrl('/a/2/6', PageComponent);

    expect(after).not.toBe(before);
  });

  it('should keep an area for another unit in it', async () => {
    const before = await harness.navigateByUrl('/a/1/5', PageComponent);

    const after = await harness.navigateByUrl('/a/1/6', PageComponent);

    expect(after).toBe(before);
  });

  it('should keep a route that loads no module for another parameter, as Angular does', async () => {
    const before = await harness.navigateByUrl('/home/first', PageComponent);

    const after = await harness.navigateByUrl('/home/second', PageComponent);

    expect(after).toBe(before);
  });
});
