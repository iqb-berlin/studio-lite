// export const UnitData = new Map<string, string[]>([
//   ['D1', ['AUF_D1', 'Name Auf 1', 'Gruppe D']],
//   ['D2', ['AUF_D2', 'Name Auf 2', '']],
//   ['S3', ['AUF_S3', 'Name Auf 3', 'Gruppe S']],
//   ['S4', ['AUF_S4', 'Name Auf 4', '']],
//   ['F5', ['AUF_F5', 'Name Auf 5', 'Gruppe F']],
//   ['F6', ['AUF_F6', 'Name Auf 6', '']]
// ]);

export class UnitData {
  private static groups: string[];

  constructor(public shortname:string, public name:string, public group:string) {
    if (UnitData.groups.indexOf(group) === -1 && group !== '') {
      UnitData.groups.push(group);
    }
  }
}

// const D1 = new UnitData('AUF_D1', 'Name Auf 1', 'Gruppe D');
// const D2 = new UnitData('AUF_D2', 'Name Auf 2', '');
// const S3 = new UnitData('AUF_S3', 'Name Auf 3', 'Gruppe S');
// const S4 = new UnitData('AUF_S4', 'Name Auf 4', '');
// const F5 = new UnitData('AUF_S5', 'Name Auf 5', 'Gruppe F');
// const F6 = new UnitData('AUF_S6', 'Name Auf 6', '');
//
// //   ['S4', ['AUF_S4', 'Name Auf 4', '']],
// //   ['F5', ['AUF_F5', 'Name Auf 5', 'Gruppe F']],
// //   ['F6', ['AUF_F6', 'Name Auf 6', '']]
//
// export const predefinedUnits = [D1, D2, S3, S4, F5, F6];
