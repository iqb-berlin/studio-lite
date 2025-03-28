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
