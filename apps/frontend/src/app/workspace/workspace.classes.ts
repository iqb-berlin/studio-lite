import {UnitInListDto, UnitMetadataDto} from "@studio-lite-lib/api-dto";

export interface UnitGroup {
  name: string;
  units: UnitInListDto[];
}

export class UnitCollection {
  groups: UnitGroup[] = [];

  constructor(units: UnitInListDto[]) {
    units.forEach(u => {
      const groupName = u.groupName ? u.groupName : '';
      let groupFound = false;
      this.groups.forEach(g => {
        if (g.name === groupName) {
          g.units.push(u);
          groupFound = true
        }
      });
      if (!groupFound) {
        this.groups.push({
          name: groupName,
          units: [u]
        })
      }
    })
  }

  units(): UnitInListDto[] {
    const myUnits: UnitInListDto[] = [];
    this.groups.forEach(g => {
      g.units.forEach(u => {
        myUnits.push(u)
      })
    })
    return myUnits;
  }
}
