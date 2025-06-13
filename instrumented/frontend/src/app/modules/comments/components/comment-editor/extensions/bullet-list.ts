function cov_p4dst8lwq() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/comments/components/comment-editor/extensions/bullet-list.ts";
  var hash = "dfb8eaa5fa6521da4f1120baffcf892d16ff485e";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/comments/components/comment-editor/extensions/bullet-list.ts",
    statementMap: {
      "0": {
        start: {
          line: 11,
          column: 35
        },
        end: {
          line: 30,
          column: 2
        }
      },
      "1": {
        start: {
          line: 13,
          column: 22
        },
        end: {
          line: 13,
          column: 33
        }
      },
      "2": {
        start: {
          line: 14,
          column: 4
        },
        end: {
          line: 20,
          column: 6
        }
      },
      "3": {
        start: {
          line: 17,
          column: 30
        },
        end: {
          line: 17,
          column: 57
        }
      },
      "4": {
        start: {
          line: 18,
          column: 35
        },
        end: {
          line: 18,
          column: 85
        }
      },
      "5": {
        start: {
          line: 24,
          column: 4
        },
        end: {
          line: 28,
          column: 6
        }
      },
      "6": {
        start: {
          line: 26,
          column: 48
        },
        end: {
          line: 27,
          column: 61
        }
      },
      "7": {
        start: {
          line: 26,
          column: 66
        },
        end: {
          line: 27,
          column: 61
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 12,
            column: 2
          },
          end: {
            line: 12,
            column: 3
          }
        },
        loc: {
          start: {
            line: 12,
            column: 18
          },
          end: {
            line: 21,
            column: 3
          }
        },
        line: 12
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 17,
            column: 19
          },
          end: {
            line: 17,
            column: 20
          }
        },
        loc: {
          start: {
            line: 17,
            column: 30
          },
          end: {
            line: 17,
            column: 57
          }
        },
        line: 17
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 18,
            column: 20
          },
          end: {
            line: 18,
            column: 21
          }
        },
        loc: {
          start: {
            line: 18,
            column: 35
          },
          end: {
            line: 18,
            column: 85
          }
        },
        line: 18
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 23,
            column: 2
          },
          end: {
            line: 23,
            column: 3
          }
        },
        loc: {
          start: {
            line: 23,
            column: 16
          },
          end: {
            line: 29,
            column: 3
          }
        },
        line: 23
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 26,
            column: 26
          },
          end: {
            line: 26,
            column: 27
          }
        },
        loc: {
          start: {
            line: 26,
            column: 48
          },
          end: {
            line: 27,
            column: 61
          }
        },
        line: 26
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 26,
            column: 48
          },
          end: {
            line: 26,
            column: 49
          }
        },
        loc: {
          start: {
            line: 26,
            column: 66
          },
          end: {
            line: 27,
            column: 61
          }
        },
        line: 26
      }
    },
    branchMap: {},
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "dfb8eaa5fa6521da4f1120baffcf892d16ff485e"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_p4dst8lwq = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_p4dst8lwq();
import { BulletList } from '@tiptap/extension-bullet-list';
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bulletListExtension: {
      setBulletListStyle: (newStyle: string) => ReturnType;
    };
  }
}
export const BulletListExtension = (cov_p4dst8lwq().s[0]++, BulletList.extend({
  addAttributes() {
    cov_p4dst8lwq().f[0]++;
    const listStyle = (cov_p4dst8lwq().s[1]++, 'listStyle');
    cov_p4dst8lwq().s[2]++;
    return {
      listStyle: {
        default: 'disc',
        parseHTML: element => {
          cov_p4dst8lwq().f[1]++;
          cov_p4dst8lwq().s[3]++;
          return element.style.listStyleType;
        },
        renderHTML: attributes => {
          cov_p4dst8lwq().f[2]++;
          cov_p4dst8lwq().s[4]++;
          return {
            style: `list-style: ${attributes[listStyle]};`
          };
        }
      }
    };
  },
  addCommands() {
    cov_p4dst8lwq().f[3]++;
    cov_p4dst8lwq().s[5]++;
    return {
      ...this.parent?.(),
      setBulletListStyle: (newStyle: string) => {
        cov_p4dst8lwq().f[4]++;
        cov_p4dst8lwq().s[6]++;
        return ({
          commands
        }) => {
          cov_p4dst8lwq().f[5]++;
          cov_p4dst8lwq().s[7]++;
          return commands.updateAttributes(this.name, {
            listStyle: newStyle
          });
        };
      }
    };
  }
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfcDRkc3Q4bHdxIiwiYWN0dWFsQ292ZXJhZ2UiLCJCdWxsZXRMaXN0IiwiQ29tbWFuZHMiLCJidWxsZXRMaXN0RXh0ZW5zaW9uIiwic2V0QnVsbGV0TGlzdFN0eWxlIiwibmV3U3R5bGUiLCJSZXR1cm5UeXBlIiwiQnVsbGV0TGlzdEV4dGVuc2lvbiIsInMiLCJleHRlbmQiLCJhZGRBdHRyaWJ1dGVzIiwiZiIsImxpc3RTdHlsZSIsImRlZmF1bHQiLCJwYXJzZUhUTUwiLCJlbGVtZW50Iiwic3R5bGUiLCJsaXN0U3R5bGVUeXBlIiwicmVuZGVySFRNTCIsImF0dHJpYnV0ZXMiLCJhZGRDb21tYW5kcyIsInBhcmVudCIsImNvbW1hbmRzIiwidXBkYXRlQXR0cmlidXRlcyIsIm5hbWUiXSwic291cmNlcyI6WyJidWxsZXQtbGlzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCdWxsZXRMaXN0IH0gZnJvbSAnQHRpcHRhcC9leHRlbnNpb24tYnVsbGV0LWxpc3QnO1xuXG5kZWNsYXJlIG1vZHVsZSAnQHRpcHRhcC9jb3JlJyB7XG4gIGludGVyZmFjZSBDb21tYW5kczxSZXR1cm5UeXBlPiB7XG4gICAgYnVsbGV0TGlzdEV4dGVuc2lvbjoge1xuICAgICAgc2V0QnVsbGV0TGlzdFN0eWxlOiAobmV3U3R5bGU6IHN0cmluZykgPT4gUmV0dXJuVHlwZTtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBCdWxsZXRMaXN0RXh0ZW5zaW9uID0gQnVsbGV0TGlzdC5leHRlbmQoe1xuICBhZGRBdHRyaWJ1dGVzKCkge1xuICAgIGNvbnN0IGxpc3RTdHlsZSA9ICdsaXN0U3R5bGUnO1xuICAgIHJldHVybiB7XG4gICAgICBsaXN0U3R5bGU6IHtcbiAgICAgICAgZGVmYXVsdDogJ2Rpc2MnLFxuICAgICAgICBwYXJzZUhUTUw6IGVsZW1lbnQgPT4gZWxlbWVudC5zdHlsZS5saXN0U3R5bGVUeXBlLFxuICAgICAgICByZW5kZXJIVE1MOiBhdHRyaWJ1dGVzID0+ICh7IHN0eWxlOiBgbGlzdC1zdHlsZTogJHthdHRyaWJ1dGVzW2xpc3RTdHlsZV19O2AgfSlcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuXG4gIGFkZENvbW1hbmRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi50aGlzLnBhcmVudD8uKCksXG4gICAgICBzZXRCdWxsZXRMaXN0U3R5bGU6IChuZXdTdHlsZTogc3RyaW5nKSA9PiAoeyBjb21tYW5kcyB9KSA9PiBjb21tYW5kc1xuICAgICAgICAudXBkYXRlQXR0cmlidXRlcyh0aGlzLm5hbWUsIHsgbGlzdFN0eWxlOiBuZXdTdHlsZSB9KVxuICAgIH07XG4gIH1cbn0pO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxhQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxhQUFBO0FBZlosU0FBU0UsVUFBVSxRQUFRLCtCQUErQjtBQUUxRCxlQUFlLGNBQWMsQ0FBQztFQUM1QixVQUFVQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDN0JDLG1CQUFtQixFQUFFO01BQ25CQyxrQkFBa0IsRUFBRSxDQUFDQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEdBQUdDLFVBQVU7SUFDdEQsQ0FBQztFQUNIO0FBQ0Y7QUFFQSxPQUFPLE1BQU1DLG1CQUFtQixJQUFBUixhQUFBLEdBQUFTLENBQUEsT0FBR1AsVUFBVSxDQUFDUSxNQUFNLENBQUM7RUFDbkRDLGFBQWFBLENBQUEsRUFBRztJQUFBWCxhQUFBLEdBQUFZLENBQUE7SUFDZCxNQUFNQyxTQUFTLElBQUFiLGFBQUEsR0FBQVMsQ0FBQSxPQUFHLFdBQVc7SUFBQ1QsYUFBQSxHQUFBUyxDQUFBO0lBQzlCLE9BQU87TUFDTEksU0FBUyxFQUFFO1FBQ1RDLE9BQU8sRUFBRSxNQUFNO1FBQ2ZDLFNBQVMsRUFBRUMsT0FBTyxJQUFJO1VBQUFoQixhQUFBLEdBQUFZLENBQUE7VUFBQVosYUFBQSxHQUFBUyxDQUFBO1VBQUEsT0FBQU8sT0FBTyxDQUFDQyxLQUFLLENBQUNDLGFBQWE7UUFBRCxDQUFDO1FBQ2pEQyxVQUFVLEVBQUVDLFVBQVUsSUFBSztVQUFBcEIsYUFBQSxHQUFBWSxDQUFBO1VBQUFaLGFBQUEsR0FBQVMsQ0FBQTtVQUFBO1lBQUVRLEtBQUssRUFBRSxlQUFlRyxVQUFVLENBQUNQLFNBQVMsQ0FBQztVQUFJLENBQUM7UUFBRDtNQUM5RTtJQUNGLENBQUM7RUFDSCxDQUFDO0VBRURRLFdBQVdBLENBQUEsRUFBRztJQUFBckIsYUFBQSxHQUFBWSxDQUFBO0lBQUFaLGFBQUEsR0FBQVMsQ0FBQTtJQUNaLE9BQU87TUFDTCxHQUFHLElBQUksQ0FBQ2EsTUFBTSxHQUFHLENBQUM7TUFDbEJqQixrQkFBa0IsRUFBRUEsQ0FBQ0MsUUFBUSxFQUFFLE1BQU0sS0FBSztRQUFBTixhQUFBLEdBQUFZLENBQUE7UUFBQVosYUFBQSxHQUFBUyxDQUFBO1FBQUEsUUFBQztVQUFFYztRQUFTLENBQUMsS0FBSztVQUFBdkIsYUFBQSxHQUFBWSxDQUFBO1VBQUFaLGFBQUEsR0FBQVMsQ0FBQTtVQUFBLE9BQUFjLFFBQVEsQ0FDakVDLGdCQUFnQixDQUFDLElBQUksQ0FBQ0MsSUFBSSxFQUFFO1lBQUVaLFNBQVMsRUFBRVA7VUFBUyxDQUFDLENBQUM7UUFBRCxDQUFDO01BQUQ7SUFDeEQsQ0FBQztFQUNIO0FBQ0YsQ0FBQyxDQUFDIiwiaWdub3JlTGlzdCI6W119