export class StringUtils {
  // camelCase conversions
  static camelCaseToUpperSnakeCase(str: string): string {
    if (!str) return str;
    return str.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase();
  }

  static camelCaseToKebabCase(str: string): string {
    if (!str) return str;
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  static camelCaseToPascalCase(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // UPPER_SNAKE_CASE conversions
  static upperSnakeCaseToCamelCase(str: string): string {
    if (!str) return str;
    return str.toLowerCase().replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  }

  static upperSnakeCaseToKebabCase(str: string): string {
    if (!str) return str;
    return str.toLowerCase().replace(/_/g, '-');
  }

  static upperSnakeCaseToPascalCase(str: string): string {
    if (!str) return str;
    return str.toLowerCase().replace(/(^|_)([a-z0-9])/g, (_, __, letter) => letter.toUpperCase());
  }

  // kebab-case conversions
  static kebabCaseToCamelCase(str: string): string {
    if (!str) return str;
    return str.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  }

  static kebabCaseToUpperSnakeCase(str: string): string {
    if (!str) return str;
    return str.replace(/-/g, '_').toUpperCase();
  }

  static kebabCaseToPascalCase(str: string): string {
    if (!str) return str;
    return str.replace(/(^|-)([a-z0-9])/g, (_, __, letter) => letter.toUpperCase());
  }

  // PascalCase conversions
  static pascalCaseToCamelCase(str: string): string {
    if (!str) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  static pascalCaseToUpperSnakeCase(str: string): string {
    if (!str) return str;
    return str.replace(/[A-Z]/g, (letter, i) => (i === 0 ? letter : `_${letter}`)).toUpperCase();
  }

  static pascalCaseToKebabCase(str: string): string {
    if (!str) return str;
    return str.replace(/[A-Z]/g, (letter, i) => (i === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`));
  }
}
