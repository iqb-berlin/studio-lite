import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideLocationMocks, SpyLocation } from '@angular/common/testing';
import {
  PRIMARY_OUTLET, provideRouter, Router, UrlSerializer
} from '@angular/router';
import { LanguageUrlSerializer } from './language-url-serializer';
import { LanguageService } from './language.service';

@Component({ template: '', standalone: true })
class EmptyComponent {}

describe('LanguageUrlSerializer', () => {
  const serializerIn = (prefix: string): LanguageUrlSerializer => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LanguageUrlSerializer,
        { provide: LanguageService, useValue: { codes: ['de', 'en'], prefix } }
      ]
    });
    return TestBed.inject(LanguageUrlSerializer);
  };

  // The router sees no prefix, so routes, links and guards stay as they were; what it writes back
  // carries the language, the secondary view and the query included (#2174).
  it.each([
    ['/en/a/5/12/editor'],
    ['/en/a/5/12/(properties//secondary:preview)'],
    ['/en/home?redirectTo=%2Fen%2Fa%2F5'],
    ['/en/home/3f2c9a1e-0b7d-4c1a-9e7f-2a6b5c4d3e21']
  ])('should read %s without the prefix and write it back with it, in English', (url: string) => {
    const serializer = serializerIn('/en');

    const tree = serializer.parse(url);

    expect(tree.root.children[PRIMARY_OUTLET].segments[0].path).not.toBe('en');
    expect(serializer.serialize(tree)).toBe(url);
  });

  it('should write German addresses without a prefix, also when one was given', () => {
    const serializer = serializerIn('');

    expect(serializer.serialize(serializer.parse('/de/a/5/12/editor'))).toBe('/a/5/12/editor');
    expect(serializer.serialize(serializer.parse('/a/5/12/editor'))).toBe('/a/5/12/editor');
  });

  it('should keep a review link as the login name it is', () => {
    const serializer = serializerIn('');

    expect(serializer.parse('/3f2c9a1e-0b7d-4c1a-9e7f-2a6b5c4d3e21').root.children[PRIMARY_OUTLET].segments[0].path)
      .toBe('3f2c9a1e-0b7d-4c1a-9e7f-2a6b5c4d3e21');
  });

  // Back to an entry from before a switch, or another prefix typed into the address bar: the router
  // goes there like to any address, guards included, and the language stays the one loaded (#2175).
  it('should let the router write an address the browser brings in the active language', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        provideLocationMocks(),
        { provide: UrlSerializer, useClass: LanguageUrlSerializer },
        { provide: LanguageService, useValue: { codes: ['de', 'en'], prefix: '/en' } }
      ]
    });
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location) as SpyLocation;
    router.initialNavigation();
    tick();

    location.simulateHashChange('/a/5/12/editor');
    tick();

    expect(router.url).toBe('/en/a/5/12/editor');
    expect(location.path()).toBe('/en/a/5/12/editor');
  }));
});
