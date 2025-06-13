function cov_yi1ag0up5() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/polyfills.ts";
  var hash = "d009b69b7c5fb7790235f84d52ad14aada7f8355";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/polyfills.ts",
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "d009b69b7c5fb7790235f84d52ad14aada7f8355"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_yi1ag0up5 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_yi1ag0up5();
/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes recent versions of Safari, Chrome (including
 * Opera), Edge on the desktop, and iOS and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/** *************************************************************************************************
 * BROWSER POLYFILLS
 */

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 * because those flags need to be set before `zone.js` being loaded, and webpack
 * will put import in the top of bundle, so user need to create a separate file
 * in this directory (for example: zone-flags.ts), and put the following flags
 * into that file, and then add the following code before importing zone.js.
 * import './zone-flags';
 *
 * The flags allowed in zone-flags.ts are listed here.
 *
 * The following flags will work for all browsers.
 *
 * (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
 * (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
 * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
 *
 *  in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
 *  with the following flag, it will bypass `zone.js` patch for IE/Edge
 *
 *  (window as any).__Zone_enable_cross_context_check = true;
 *
 */

/** *************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js'; // Included with Angular CLI.

/** *************************************************************************************************
 * APPLICATION IMPORTS
 */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfeWkxYWcwdXA1IiwiYWN0dWFsQ292ZXJhZ2UiXSwic291cmNlcyI6WyJwb2x5ZmlsbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIGZpbGUgaW5jbHVkZXMgcG9seWZpbGxzIG5lZWRlZCBieSBBbmd1bGFyIGFuZCBpcyBsb2FkZWQgYmVmb3JlIHRoZSBhcHAuXG4gKiBZb3UgY2FuIGFkZCB5b3VyIG93biBleHRyYSBwb2x5ZmlsbHMgdG8gdGhpcyBmaWxlLlxuICpcbiAqIFRoaXMgZmlsZSBpcyBkaXZpZGVkIGludG8gMiBzZWN0aW9uczpcbiAqICAgMS4gQnJvd3NlciBwb2x5ZmlsbHMuIFRoZXNlIGFyZSBhcHBsaWVkIGJlZm9yZSBsb2FkaW5nIFpvbmVKUyBhbmQgYXJlIHNvcnRlZCBieSBicm93c2Vycy5cbiAqICAgMi4gQXBwbGljYXRpb24gaW1wb3J0cy4gRmlsZXMgaW1wb3J0ZWQgYWZ0ZXIgWm9uZUpTIHRoYXQgc2hvdWxkIGJlIGxvYWRlZCBiZWZvcmUgeW91ciBtYWluXG4gKiAgICAgIGZpbGUuXG4gKlxuICogVGhlIGN1cnJlbnQgc2V0dXAgaXMgZm9yIHNvLWNhbGxlZCBcImV2ZXJncmVlblwiIGJyb3dzZXJzOyB0aGUgbGFzdCB2ZXJzaW9ucyBvZiBicm93c2VycyB0aGF0XG4gKiBhdXRvbWF0aWNhbGx5IHVwZGF0ZSB0aGVtc2VsdmVzLiBUaGlzIGluY2x1ZGVzIHJlY2VudCB2ZXJzaW9ucyBvZiBTYWZhcmksIENocm9tZSAoaW5jbHVkaW5nXG4gKiBPcGVyYSksIEVkZ2Ugb24gdGhlIGRlc2t0b3AsIGFuZCBpT1MgYW5kIENocm9tZSBvbiBtb2JpbGUuXG4gKlxuICogTGVhcm4gbW9yZSBpbiBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvYnJvd3Nlci1zdXBwb3J0XG4gKi9cblxuLyoqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIEJST1dTRVIgUE9MWUZJTExTXG4gKi9cblxuLyoqXG4gKiBCeSBkZWZhdWx0LCB6b25lLmpzIHdpbGwgcGF0Y2ggYWxsIHBvc3NpYmxlIG1hY3JvVGFzayBhbmQgRG9tRXZlbnRzXG4gKiB1c2VyIGNhbiBkaXNhYmxlIHBhcnRzIG9mIG1hY3JvVGFzay9Eb21FdmVudHMgcGF0Y2ggYnkgc2V0dGluZyBmb2xsb3dpbmcgZmxhZ3NcbiAqIGJlY2F1c2UgdGhvc2UgZmxhZ3MgbmVlZCB0byBiZSBzZXQgYmVmb3JlIGB6b25lLmpzYCBiZWluZyBsb2FkZWQsIGFuZCB3ZWJwYWNrXG4gKiB3aWxsIHB1dCBpbXBvcnQgaW4gdGhlIHRvcCBvZiBidW5kbGUsIHNvIHVzZXIgbmVlZCB0byBjcmVhdGUgYSBzZXBhcmF0ZSBmaWxlXG4gKiBpbiB0aGlzIGRpcmVjdG9yeSAoZm9yIGV4YW1wbGU6IHpvbmUtZmxhZ3MudHMpLCBhbmQgcHV0IHRoZSBmb2xsb3dpbmcgZmxhZ3NcbiAqIGludG8gdGhhdCBmaWxlLCBhbmQgdGhlbiBhZGQgdGhlIGZvbGxvd2luZyBjb2RlIGJlZm9yZSBpbXBvcnRpbmcgem9uZS5qcy5cbiAqIGltcG9ydCAnLi96b25lLWZsYWdzJztcbiAqXG4gKiBUaGUgZmxhZ3MgYWxsb3dlZCBpbiB6b25lLWZsYWdzLnRzIGFyZSBsaXN0ZWQgaGVyZS5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGZsYWdzIHdpbGwgd29yayBmb3IgYWxsIGJyb3dzZXJzLlxuICpcbiAqICh3aW5kb3cgYXMgYW55KS5fX1pvbmVfZGlzYWJsZV9yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB0cnVlOyAvLyBkaXNhYmxlIHBhdGNoIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuICogKHdpbmRvdyBhcyBhbnkpLl9fWm9uZV9kaXNhYmxlX29uX3Byb3BlcnR5ID0gdHJ1ZTsgLy8gZGlzYWJsZSBwYXRjaCBvblByb3BlcnR5IHN1Y2ggYXMgb25jbGlja1xuICogKHdpbmRvdyBhcyBhbnkpLl9fem9uZV9zeW1ib2xfX1VOUEFUQ0hFRF9FVkVOVFMgPSBbJ3Njcm9sbCcsICdtb3VzZW1vdmUnXTsgLy8gZGlzYWJsZSBwYXRjaCBzcGVjaWZpZWQgZXZlbnROYW1lc1xuICpcbiAqICBpbiBJRS9FZGdlIGRldmVsb3BlciB0b29scywgdGhlIGFkZEV2ZW50TGlzdGVuZXIgd2lsbCBhbHNvIGJlIHdyYXBwZWQgYnkgem9uZS5qc1xuICogIHdpdGggdGhlIGZvbGxvd2luZyBmbGFnLCBpdCB3aWxsIGJ5cGFzcyBgem9uZS5qc2AgcGF0Y2ggZm9yIElFL0VkZ2VcbiAqXG4gKiAgKHdpbmRvdyBhcyBhbnkpLl9fWm9uZV9lbmFibGVfY3Jvc3NfY29udGV4dF9jaGVjayA9IHRydWU7XG4gKlxuICovXG5cbi8qKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBab25lIEpTIGlzIHJlcXVpcmVkIGJ5IGRlZmF1bHQgZm9yIEFuZ3VsYXIgaXRzZWxmLlxuICovXG5pbXBvcnQgJ3pvbmUuanMnOyAvLyBJbmNsdWRlZCB3aXRoIEFuZ3VsYXIgQ0xJLlxuXG4vKiogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogQVBQTElDQVRJT04gSU1QT1JUU1xuICovXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxhQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxhQUFBO0FBZlo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBUyxDQUFDLENBQUM7O0FBRWxCO0FBQ0E7QUFDQSIsImlnbm9yZUxpc3QiOltdfQ==