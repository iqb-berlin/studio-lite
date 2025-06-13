function cov_2edgrih6kn() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/review/models/unit-data.class.ts";
  var hash = "26e9d7b670ca6d64e2ac46f693a275b578c9b7df";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/review/models/unit-data.class.ts",
    statementMap: {
      "0": {
        start: {
          line: 6,
          column: 15
        },
        end: {
          line: 6,
          column: 16
        }
      },
      "1": {
        start: {
          line: 7,
          column: 15
        },
        end: {
          line: 7,
          column: 16
        }
      },
      "2": {
        start: {
          line: 8,
          column: 9
        },
        end: {
          line: 8,
          column: 11
        }
      },
      "3": {
        start: {
          line: 9,
          column: 14
        },
        end: {
          line: 9,
          column: 16
        }
      },
      "4": {
        start: {
          line: 10,
          column: 13
        },
        end: {
          line: 10,
          column: 15
        }
      },
      "5": {
        start: {
          line: 11,
          column: 15
        },
        end: {
          line: 11,
          column: 17
        }
      }
    },
    fnMap: {},
    branchMap: {},
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    f: {},
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "26e9d7b670ca6d64e2ac46f693a275b578c9b7df"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_2edgrih6kn = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_2edgrih6kn();
import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { VariableCodingData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { Comment } from '../../comments/models/comment.interface';
export class UnitData {
  databaseId = (cov_2edgrih6kn().s[0]++, 0);
  sequenceId = (cov_2edgrih6kn().s[1]++, 0);
  name = (cov_2edgrih6kn().s[2]++, '');
  responses = (cov_2edgrih6kn().s[3]++, '');
  playerId = (cov_2edgrih6kn().s[4]++, '');
  definition = (cov_2edgrih6kn().s[5]++, '');
  dbMetadata?: UnitPropertiesDto;
  codingSchemeVariables?: VariableCodingData[];
  comments?: Comment[];
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMmVkZ3JpaDZrbiIsImFjdHVhbENvdmVyYWdlIiwiVW5pdFByb3BlcnRpZXNEdG8iLCJWYXJpYWJsZUNvZGluZ0RhdGEiLCJDb21tZW50IiwiVW5pdERhdGEiLCJkYXRhYmFzZUlkIiwicyIsInNlcXVlbmNlSWQiLCJuYW1lIiwicmVzcG9uc2VzIiwicGxheWVySWQiLCJkZWZpbml0aW9uIiwiZGJNZXRhZGF0YSIsImNvZGluZ1NjaGVtZVZhcmlhYmxlcyIsImNvbW1lbnRzIl0sInNvdXJjZXMiOlsidW5pdC1kYXRhLmNsYXNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFVuaXRQcm9wZXJ0aWVzRHRvIH0gZnJvbSAnQHN0dWRpby1saXRlLWxpYi9hcGktZHRvJztcbmltcG9ydCB7IFZhcmlhYmxlQ29kaW5nRGF0YSB9IGZyb20gJ0BpcWJzcGVjcy9jb2Rpbmctc2NoZW1lL2NvZGluZy1zY2hlbWUuaW50ZXJmYWNlJztcbmltcG9ydCB7IENvbW1lbnQgfSBmcm9tICcuLi8uLi9jb21tZW50cy9tb2RlbHMvY29tbWVudC5pbnRlcmZhY2UnO1xuXG5leHBvcnQgY2xhc3MgVW5pdERhdGEge1xuICBkYXRhYmFzZUlkID0gMDtcbiAgc2VxdWVuY2VJZCA9IDA7XG4gIG5hbWUgPSAnJztcbiAgcmVzcG9uc2VzID0gJyc7XG4gIHBsYXllcklkID0gJyc7XG4gIGRlZmluaXRpb24gPSAnJztcbiAgZGJNZXRhZGF0YT86IFVuaXRQcm9wZXJ0aWVzRHRvO1xuICBjb2RpbmdTY2hlbWVWYXJpYWJsZXM/OiBWYXJpYWJsZUNvZGluZ0RhdGFbXTtcbiAgY29tbWVudHM/OiBDb21tZW50W107XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWVZO0lBQUFBLGNBQUEsWUFBQUEsQ0FBQTtNQUFBLE9BQUFDLGNBQUE7SUFBQTtFQUFBO0VBQUEsT0FBQUEsY0FBQTtBQUFBO0FBQUFELGNBQUE7QUFmWixTQUFTRSxpQkFBaUIsUUFBUSwwQkFBMEI7QUFDNUQsU0FBU0Msa0JBQWtCLFFBQVEsaURBQWlEO0FBQ3BGLFNBQVNDLE9BQU8sUUFBUSx5Q0FBeUM7QUFFakUsT0FBTyxNQUFNQyxRQUFRLENBQUM7RUFDcEJDLFVBQVUsSUFBQU4sY0FBQSxHQUFBTyxDQUFBLE9BQUcsQ0FBQztFQUNkQyxVQUFVLElBQUFSLGNBQUEsR0FBQU8sQ0FBQSxPQUFHLENBQUM7RUFDZEUsSUFBSSxJQUFBVCxjQUFBLEdBQUFPLENBQUEsT0FBRyxFQUFFO0VBQ1RHLFNBQVMsSUFBQVYsY0FBQSxHQUFBTyxDQUFBLE9BQUcsRUFBRTtFQUNkSSxRQUFRLElBQUFYLGNBQUEsR0FBQU8sQ0FBQSxPQUFHLEVBQUU7RUFDYkssVUFBVSxJQUFBWixjQUFBLEdBQUFPLENBQUEsT0FBRyxFQUFFO0VBQ2ZNLFVBQVUsQ0FBQyxFQUFFWCxpQkFBaUI7RUFDOUJZLHFCQUFxQixDQUFDLEVBQUVYLGtCQUFrQixFQUFFO0VBQzVDWSxRQUFRLENBQUMsRUFBRVgsT0FBTyxFQUFFO0FBQ3RCIiwiaWdub3JlTGlzdCI6W119