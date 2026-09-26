import { NotAUnitXmlError } from './not-a-unit-xml.error';

describe('NotAUnitXmlError', () => {
  it('should name the root element it found', () => {
    const error = new NotAUnitXmlError('Something');

    expect(error).toBeInstanceOf(Error);
    expect(error.rootElement).toBe('Something');
    expect(error.message).toBe('not a unit file: <Something>');
  });

  it.each(['Booklet', 'Testtakers'])('should take <%s> for a file the export writes for the Testcenter', root => {
    expect(new NotAUnitXmlError(root).isTestcenterFile).toBe(true);
  });

  it.each(['Something', 'booklet', ''])('should not take <%s> for a Testcenter file', root => {
    expect(new NotAUnitXmlError(root).isTestcenterFile).toBe(false);
  });
});
