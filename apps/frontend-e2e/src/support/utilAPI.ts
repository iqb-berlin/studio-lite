export function buildQueryParameters(id:string, values:string[]):string {
  const [first, ...rest] = values;
  let output = `?${id}=${first}`;
  if (values.length > 1) {
    rest.forEach(v => {
      (output += `&${id}=${v}`);
    });
  }
  return output;
}

export function buildQueryParametersComplex(parameters: string[], values: (boolean | string)[], ids: string[]):string {
  let output = `?${parameters[0]}=${values[0]}`;
  for (let i = 1; i < values.length; i++) {
    output += `&${parameters[i]}=${values[i]}`;
  }
  const [first, ...rest] = ids;
  output += `&id=${first}`;
  if (values.length > 1) {
    rest.forEach(v => {
      (output += `&id=${v}`);
    });
  }
  return output;
}

export function buildDownloadQuery(unitIds: string[]):string {
  if (unitIds.length > 0) {
    const [first, ...rest] = unitIds;
    let output:string;
    output = `{"unitIdList":[${first}`;
    if (unitIds.length > 1) {
      rest.forEach(v => {
        (output += `,${v}`);
      });
    }
    output += '],"addComments":false,"addPlayers":false,"addTestTakersReview":0,' +
      '"addTestTakersMonitor":0,"addTestTakersHot":0,"passwordLess":false,"bookletSettings":[]}';
    return output;
  }

  return '{"unitIdList":[],"addComments":false,"addPlayers":false,"addTestTakersReview":0,' +
      '"addTestTakersMonitor":0,"addTestTakersHot":0,"passwordLess":false,"bookletSettings":[]}';
}
