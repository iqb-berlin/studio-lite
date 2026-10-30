/**
 * The value of an `xs:boolean` written as text: `true` and `1` are true, `false` and `0` false, with the
 * surrounding white space the type ignores. Read as it is, the text is a string, and "false" counts as
 * true (#1987).
 */
export function readXsdBoolean(text: string | undefined): boolean {
  return ['true', '1'].includes(text?.trim());
}
