/**
 * An XML file whose root element is not `<Unit>`. The export puts the Testcenter's booklet and
 * test-taker files next to the units; they are part of its own output rather than a broken unit,
 * and the import passes over them without a warning (#1710).
 */
export class NotAUnitXmlError extends Error {
  readonly isTestcenterFile: boolean;

  constructor(readonly rootElement: string) {
    super(`not a unit file: <${rootElement}>`);
    this.isTestcenterFile = ['Booklet', 'Testtakers'].includes(rootElement);
  }
}
