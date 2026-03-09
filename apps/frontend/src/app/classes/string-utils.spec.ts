import { StringUtils } from './string-utils';

describe('StringUtils', () => {
  // camelCase tests
  it('should convert camel case to upper snake case', () => {
    expect(StringUtils.camelCaseToUpperSnakeCase('camelCase')).toBe('CAMEL_CASE');
    expect(StringUtils.camelCaseToUpperSnakeCase('camelCaseString')).toBe('CAMEL_CASE_STRING');
    expect(StringUtils.camelCaseToUpperSnakeCase('test')).toBe('TEST');
    expect(StringUtils.camelCaseToUpperSnakeCase('camel')).toBe('CAMEL');
    expect(StringUtils.camelCaseToUpperSnakeCase('')).toBe('');
  });

  it('should convert camel case to kebab case', () => {
    expect(StringUtils.camelCaseToKebabCase('camelCase')).toBe('camel-case');
    expect(StringUtils.camelCaseToKebabCase('camelCaseString')).toBe('camel-case-string');
    expect(StringUtils.camelCaseToKebabCase('test')).toBe('test');
    expect(StringUtils.camelCaseToKebabCase('camel')).toBe('camel');
    expect(StringUtils.camelCaseToKebabCase('')).toBe('');
  });

  it('should convert camel case to pascal case', () => {
    expect(StringUtils.camelCaseToPascalCase('camelCase')).toBe('CamelCase');
    expect(StringUtils.camelCaseToPascalCase('camelCaseString')).toBe('CamelCaseString');
    expect(StringUtils.camelCaseToPascalCase('test')).toBe('Test');
    expect(StringUtils.camelCaseToPascalCase('camel')).toBe('Camel');
    expect(StringUtils.camelCaseToPascalCase('')).toBe('');
  });

  // UPPER_SNAKE_CASE tests
  it('should convert upper snake case to camel case', () => {
    expect(StringUtils.upperSnakeCaseToCamelCase('CAMEL_CASE')).toBe('camelCase');
    expect(StringUtils.upperSnakeCaseToCamelCase('CAMEL_CASE_STRING')).toBe('camelCaseString');
    expect(StringUtils.upperSnakeCaseToCamelCase('TEST')).toBe('test');
    expect(StringUtils.upperSnakeCaseToCamelCase('CAMEL')).toBe('camel');
    expect(StringUtils.upperSnakeCaseToCamelCase('')).toBe('');
  });

  it('should convert upper snake case to kebab case', () => {
    expect(StringUtils.upperSnakeCaseToKebabCase('CAMEL_CASE')).toBe('camel-case');
    expect(StringUtils.upperSnakeCaseToKebabCase('CAMEL_CASE_STRING')).toBe('camel-case-string');
    expect(StringUtils.upperSnakeCaseToKebabCase('TEST')).toBe('test');
    expect(StringUtils.upperSnakeCaseToKebabCase('CAMEL')).toBe('camel');
    expect(StringUtils.upperSnakeCaseToKebabCase('')).toBe('');
  });

  it('should convert upper snake case to pascal case', () => {
    expect(StringUtils.upperSnakeCaseToPascalCase('CAMEL_CASE')).toBe('CamelCase');
    expect(StringUtils.upperSnakeCaseToPascalCase('CAMEL_CASE_STRING')).toBe('CamelCaseString');
    expect(StringUtils.upperSnakeCaseToPascalCase('TEST')).toBe('Test');
    expect(StringUtils.upperSnakeCaseToPascalCase('CAMEL')).toBe('Camel');
    expect(StringUtils.upperSnakeCaseToPascalCase('')).toBe('');
  });

  // kebab-case tests
  it('should convert kebab case to camel case', () => {
    expect(StringUtils.kebabCaseToCamelCase('camel-case')).toBe('camelCase');
    expect(StringUtils.kebabCaseToCamelCase('camel-case-string')).toBe('camelCaseString');
    expect(StringUtils.kebabCaseToCamelCase('test')).toBe('test');
    expect(StringUtils.kebabCaseToCamelCase('camel')).toBe('camel');
    expect(StringUtils.kebabCaseToCamelCase('')).toBe('');
  });

  it('should convert kebab case to upper snake case', () => {
    expect(StringUtils.kebabCaseToUpperSnakeCase('camel-case')).toBe('CAMEL_CASE');
    expect(StringUtils.kebabCaseToUpperSnakeCase('camel-case-string')).toBe('CAMEL_CASE_STRING');
    expect(StringUtils.kebabCaseToUpperSnakeCase('test')).toBe('TEST');
    expect(StringUtils.kebabCaseToUpperSnakeCase('camel')).toBe('CAMEL');
    expect(StringUtils.kebabCaseToUpperSnakeCase('')).toBe('');
  });

  it('should convert kebab case to pascal case', () => {
    expect(StringUtils.kebabCaseToPascalCase('camel-case')).toBe('CamelCase');
    expect(StringUtils.kebabCaseToPascalCase('camel-case-string')).toBe('CamelCaseString');
    expect(StringUtils.kebabCaseToPascalCase('test')).toBe('Test');
    expect(StringUtils.kebabCaseToPascalCase('camel')).toBe('Camel');
    expect(StringUtils.kebabCaseToPascalCase('')).toBe('');
  });

  // PascalCase tests
  it('should convert pascal case to camel case', () => {
    expect(StringUtils.pascalCaseToCamelCase('CamelCase')).toBe('camelCase');
    expect(StringUtils.pascalCaseToCamelCase('CamelCaseString')).toBe('camelCaseString');
    expect(StringUtils.pascalCaseToCamelCase('Test')).toBe('test');
    expect(StringUtils.pascalCaseToCamelCase('Camel')).toBe('camel');
    expect(StringUtils.pascalCaseToCamelCase('')).toBe('');
  });

  it('should convert pascal case to upper snake case', () => {
    expect(StringUtils.pascalCaseToUpperSnakeCase('CamelCase')).toBe('CAMEL_CASE');
    expect(StringUtils.pascalCaseToUpperSnakeCase('CamelCaseString')).toBe('CAMEL_CASE_STRING');
    expect(StringUtils.pascalCaseToUpperSnakeCase('Test')).toBe('TEST');
    expect(StringUtils.pascalCaseToUpperSnakeCase('Camel')).toBe('CAMEL');
    expect(StringUtils.pascalCaseToUpperSnakeCase('')).toBe('');
  });

  it('should convert pascal case to kebab case', () => {
    expect(StringUtils.pascalCaseToKebabCase('CamelCase')).toBe('camel-case');
    expect(StringUtils.pascalCaseToKebabCase('CamelCaseString')).toBe('camel-case-string');
    expect(StringUtils.pascalCaseToKebabCase('Test')).toBe('test');
    expect(StringUtils.pascalCaseToKebabCase('Camel')).toBe('camel');
    expect(StringUtils.pascalCaseToKebabCase('')).toBe('');
  });
});
