function cov_zul26u73l() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/comments/models/comment.interface.ts";
  var hash = "ab22ebffb97f8b38d646f67bfec4357328b97fcf";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/comments/models/comment.interface.ts",
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "ab22ebffb97f8b38d646f67bfec4357328b97fcf"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_zul26u73l = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_zul26u73l();
export interface Comment {
  id: number;
  body: string;
  userName: string;
  userId: number;
  unitId: number;
  parentId: number | null;
  createdAt: Date;
  changedAt: Date;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfenVsMjZ1NzNsIiwiYWN0dWFsQ292ZXJhZ2UiLCJDb21tZW50IiwiaWQiLCJib2R5IiwidXNlck5hbWUiLCJ1c2VySWQiLCJ1bml0SWQiLCJwYXJlbnRJZCIsImNyZWF0ZWRBdCIsIkRhdGUiLCJjaGFuZ2VkQXQiXSwic291cmNlcyI6WyJjb21tZW50LmludGVyZmFjZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIENvbW1lbnQge1xuICBpZDogbnVtYmVyO1xuICBib2R5OiBzdHJpbmc7XG4gIHVzZXJOYW1lOiBzdHJpbmc7XG4gIHVzZXJJZDogbnVtYmVyO1xuICB1bml0SWQ6IG51bWJlcjtcbiAgcGFyZW50SWQ6IG51bWJlciB8IG51bGw7XG4gIGNyZWF0ZWRBdDogRGF0ZTtcbiAgY2hhbmdlZEF0OiBEYXRlO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZVk7SUFBQUEsYUFBQSxZQUFBQSxDQUFBO01BQUEsT0FBQUMsY0FBQTtJQUFBO0VBQUE7RUFBQSxPQUFBQSxjQUFBO0FBQUE7QUFBQUQsYUFBQTtBQWZaLE9BQU8sVUFBVUUsT0FBTyxDQUFDO0VBQ3ZCQyxFQUFFLEVBQUUsTUFBTTtFQUNWQyxJQUFJLEVBQUUsTUFBTTtFQUNaQyxRQUFRLEVBQUUsTUFBTTtFQUNoQkMsTUFBTSxFQUFFLE1BQU07RUFDZEMsTUFBTSxFQUFFLE1BQU07RUFDZEMsUUFBUSxFQUFFLE1BQU0sR0FBRyxJQUFJO0VBQ3ZCQyxTQUFTLEVBQUVDLElBQUk7RUFDZkMsU0FBUyxFQUFFRCxJQUFJO0FBQ2pCIiwiaWdub3JlTGlzdCI6W119