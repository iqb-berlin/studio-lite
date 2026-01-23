/**
 * Query builder utilities for API requests
 * Contains functions for building query strings and request parameters
 */

/**
 * Builds query parameters for API requests with multiple values
 * @param id - Parameter name
 * @param values - Array of parameter values
 * @returns Query string (e.g., "?id=value1&id=value2")
 * @example
 * buildQueryParameters('userId', ['123', '456'])
 * // Returns: "?userId=123&userId=456"
 */
export function buildQueryParameters(id: string, values: string[]): string {
  const [first, ...rest] = values;
  let output = `?${id}=${first}`;
  if (values.length > 1) {
    rest.forEach(v => {
      output += `&${id}=${v}`;
    });
  }
  return output;
}

/**
 * Builds complex query parameters with multiple parameter types
 * @param parameters - Array of parameter names
 * @param values - Array of parameter values (boolean or string)
 * @param ids - Array of ID values
 * @returns Query string with all parameters
 * @example
 * buildQueryParametersComplex(['full', 'active'], [true, 'yes'], ['1', '2'])
 * // Returns: "?full=true&active=yes&id=1&id=2"
 */
export function buildQueryParametersComplex(
  parameters: string[],
  values: (boolean | string)[],
  ids: string[]
): string {
  let output = `?${parameters[0]}=${values[0]}`;
  for (let i = 1; i < values.length; i++) {
    output += `&${parameters[i]}=${values[i]}`;
  }
  const [first, ...rest] = ids;
  output += `&id=${first}`;
  if (values.length > 1) {
    rest.forEach(v => {
      output += `&id=${v}`;
    });
  }
  return output;
}

/**
 * Builds download query JSON for unit export
 * @param unitIds - Array of unit IDs to download
 * @returns JSON string for download request body
 * @example
 * buildDownloadQuery(['1', '2', '3'])
 * // Returns: '{"unitIdList":[1,2,3],"addComments":false,...}'
 */
export function buildDownloadQuery(unitIds: string[]): string {
  if (unitIds.length > 0) {
    const [first, ...rest] = unitIds;
    let output: string;
    output = `{"unitIdList":[${first}`;
    if (unitIds.length > 1) {
      rest.forEach(v => {
        output += `,${v}`;
      });
    }
    output += '],"addComments":false,"addPlayers":false,"addTestTakersReview":0,' +
            '"addTestTakersMonitor":0,"addTestTakersHot":0,"passwordLess":false,"bookletSettings":[]}';
    return output;
  }

  return '{"unitIdList":[],"addComments":false,"addPlayers":false,"addTestTakersReview":0,' +
        '"addTestTakersMonitor":0,"addTestTakersHot":0,"passwordLess":false,"bookletSettings":[]}';
}
