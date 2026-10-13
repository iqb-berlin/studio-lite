import { TranslateService } from '@ngx-translate/core';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WIDGET_TEXT_NAMES } from '@iqb/gate-angular';
import * as de from '../../assets/i18n/de.json';
import { gateTextsFrom } from './gate-texts';

describe('gateTextsFrom', () => {
  let translate: DeepMocked<TranslateService>;

  beforeEach(() => {
    translate = createMock<TranslateService>();
    translate.instant.mockImplementation((key: string | string[]) => `<${String(key)}>`);
  });

  it('should take the dialog\'s texts from the studio\'s translations', () => {
    const texts = gateTextsFrom(translate);

    expect(texts.title).toBe('<human-verification.title>');
    expect(texts.intro).toBe('<human-verification.intro>');
    expect(texts.failed).toBe('<human-verification.failed>');
    expect(texts.loadFailed).toBe('<human-verification.load-failed>');
    expect(texts.retry).toBe('<human-verification.retry>');
    expect(texts.cancel).toBe('<human-verification.cancel>');
  });

  it('should take the texts of the notice that the gateway refused a request', () => {
    const texts = gateTextsFrom(translate);

    expect(texts.refusalTitle).toBe('<human-verification.refusal-title>');
    expect(texts.automationDetected).toBe('<human-verification.automation-detected>');
    expect(texts.notVerified).toBe('<human-verification.not-verified>');
    expect(texts.close).toBe('<human-verification.close>');
  });

  it('should take every text of the widget', () => {
    const texts = gateTextsFrom(translate);

    expect(Object.keys(texts.widget ?? {})).toEqual([...WIDGET_TEXT_NAMES]);
    expect(texts.widget?.label).toBe('<human-verification.widget.label>');
  });

  it('should leave a text without a translation to the library', () => {
    translate.instant.mockImplementation((key: string | string[]) => (
      key === 'human-verification.retry' ? key : `<${String(key)}>`
    ));

    const texts = gateTextsFrom(translate);

    expect(texts.retry).toBeUndefined();
    expect(texts.cancel).toBe('<human-verification.cancel>');
  });

  it('should find every text it asks for in de.json', () => {
    const lookUp = (key: string): unknown => key.split('.')
      .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], de);
    translate.instant.mockImplementation((key: string | string[]) => {
      const found = lookUp(String(key));
      return typeof found === 'string' ? found : String(key);
    });

    const { widget, ...dialog } = gateTextsFrom(translate);

    expect(Object.keys(dialog)).toHaveLength(10);
    expect(Object.values(dialog).every(text => typeof text === 'string')).toBe(true);
    expect(Object.values(widget ?? {}).every(text => typeof text === 'string')).toBe(true);
  });
});
