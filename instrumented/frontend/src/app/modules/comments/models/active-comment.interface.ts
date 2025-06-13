function cov_ibii574v7() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/comments/models/active-comment.interface.ts";
  var hash = "89a728620365ed6e74ba7f39040456cac42f8d10";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/comments/models/active-comment.interface.ts",
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "89a728620365ed6e74ba7f39040456cac42f8d10"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_ibii574v7 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_ibii574v7();
export interface ActiveComment {
  id: number;
  type: ActiveCommentType;
}
export enum ActiveCommentType {
  replying = 'replying',
  editing = 'editing',
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfaWJpaTU3NHY3IiwiYWN0dWFsQ292ZXJhZ2UiLCJBY3RpdmVDb21tZW50IiwiaWQiLCJ0eXBlIiwiQWN0aXZlQ29tbWVudFR5cGUiLCJyZXBseWluZyIsImVkaXRpbmciXSwic291cmNlcyI6WyJhY3RpdmUtY29tbWVudC5pbnRlcmZhY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBBY3RpdmVDb21tZW50IHtcbiAgaWQ6IG51bWJlcjtcbiAgdHlwZTogQWN0aXZlQ29tbWVudFR5cGU7XG59XG5cbmV4cG9ydCBlbnVtIEFjdGl2ZUNvbW1lbnRUeXBlIHtcbiAgcmVwbHlpbmcgPSAncmVwbHlpbmcnLFxuICBlZGl0aW5nID0gJ2VkaXRpbmcnXG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxhQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxhQUFBO0FBZlosT0FBTyxVQUFVRSxhQUFhLENBQUM7RUFDN0JDLEVBQUUsRUFBRSxNQUFNO0VBQ1ZDLElBQUksRUFBRUMsaUJBQWlCO0FBQ3pCO0FBRUEsT0FBTyxLQUFLQSxpQkFBaUI7RUFDM0JDLFFBQVEsR0FBRyxVQUFVO0VBQ3JCQyxPQUFPLEdBQUcsU0FBUztBQUNyQiIsImlnbm9yZUxpc3QiOltdfQ==