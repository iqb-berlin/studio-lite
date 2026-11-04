import { UnitDownloadSettingsDto, UnitExportConfigDto, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import type AdmZip from 'adm-zip';
import * as XmlBuilder from 'xmlbuilder2';
// Type-only, like every deep import into a package: should the package add an `exports` map, a
// runtime require of this path would kill the boot -- see the import in api-file.decorator.ts.
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

/**
 * The testcenter files beside the units of an XML export: a booklet over all units and the test
 * takers who may log in to it, with generated logins.
 */
export class BookletDownloadClass {
  static createBookletXml(
    unitExportConfig: UnitExportConfigDto,
    bookletId: string = 'booklet1',
    bookletLabel: string = ''
  ): XMLBuilder {
    return XmlBuilder.create(
      { version: '1.0' },
      {
        Booklet: {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:noNamespaceSchemaLocation': unitExportConfig.bookletXsdUrl,
          Metadata: {
            Id: bookletId,
            Label: bookletLabel
          }
        }
      }
    );
  }

  static safeBookletId(raw: string | undefined): string {
    return (raw || 'booklet1').replace(/[^A-Za-z0-9_-]/g, '_');
  }

  static addBooklet(
    unitExportConfig: UnitExportConfigDto,
    unitDownloadSettings: UnitDownloadSettingsDto,
    unitsMetadata: UnitPropertiesDto[],
    zip: AdmZip
  ): void {
    const bookletId = BookletDownloadClass.safeBookletId(unitDownloadSettings.bookletId);
    const bookletLabel = unitDownloadSettings.bookletLabel ?? '';
    const bookletXml = BookletDownloadClass.createBookletXml(unitExportConfig, bookletId, bookletLabel);
    const configElement = bookletXml.root().ele('BookletConfig');
    unitDownloadSettings.bookletSettings.forEach(bc => {
      configElement.ele({
        Config: {
          '@key': bc.key,
          '#': bc.value
        }
      });
    });
    const unitsElement = bookletXml.root().ele('Units');
    unitsMetadata.forEach((u, i) => {
      unitsElement.ele({
        Unit: {
          '@id': u.key,
          '@label': u.name || `Aufgabe ${i + 1}`,
          '@labelshort': `${i + 1}`
        }
      });
    });
    zip.addFile(
      `${bookletId}.xml`,
      Buffer.from(bookletXml.toString({ prettyPrint: true }))
    );
  }

  static createTestTakersXml(
    unitExportConfig: UnitExportConfigDto
  ): XMLBuilder {
    return XmlBuilder.create(
      { version: '1.0' },
      {
        Testtakers: {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:noNamespaceSchemaLocation': unitExportConfig.testTakersXsdUrl,
          Metadata: {}
        }
      }
    );
  }

  static addTestTakers(
    unitExportConfig: UnitExportConfigDto,
    unitDownloadSettings: UnitDownloadSettingsDto,
    loginCount: number,
    zip: AdmZip
  ): void {
    const bookletId = BookletDownloadClass.safeBookletId(unitDownloadSettings.bookletId);
    const testTakerXml =
      BookletDownloadClass.createTestTakersXml(unitExportConfig);
    let codeLen = loginCount > 1000 ? 8 : 5;
    if (unitDownloadSettings.passwordLess) codeLen += 2;
    const loginNames = BookletDownloadClass.generateCodeList(
      codeLen,
      loginCount + 1
    );
    const loginPasswords = unitDownloadSettings.passwordLess ?
      <string[]>[] :
      BookletDownloadClass.generateCodeList(
        loginCount > 1000 ? 5 : 4,
        loginCount
      );
    let loginIndex = 0;
    const groupLabel = unitDownloadSettings.groupLabel ?? '';
    const groupElement = testTakerXml.root().ele({
      Group: {
        '@id': `${bookletId}_group`,
        '@label': groupLabel
      }
    });
    Array.from({ length: unitDownloadSettings.addTestTakersHot }).forEach((_, i) => {
      loginIndex += 1;
      const prefix =
        unitDownloadSettings.addTestTakersMonitor > 0 ?
          `T${(i + 1).toString().padStart(2, '0')}_` :
          '';
      const loginElement = groupElement.ele({
        Login: {
          '@mode': 'run-hot-return',
          '@name': `${prefix}${loginNames[loginIndex]}`
        }
      });
      if (!unitDownloadSettings.passwordLess) loginElement.att('pw', loginPasswords[loginIndex - 1]);
      loginElement.ele({
        Booklet: {
          '#': bookletId
        }
      });
    });
    Array.from({ length: unitDownloadSettings.addTestTakersReview }).forEach(() => {
      loginIndex += 1;
      const loginElement = groupElement.ele({
        Login: {
          '@mode': 'run-review',
          '@name': loginNames[loginIndex]
        }
      });
      if (!unitDownloadSettings.passwordLess) loginElement.att('pw', loginPasswords[loginIndex - 1]);
      loginElement.ele({
        Booklet: {
          '#': bookletId
        }
      });
    });
    Array.from({ length: unitDownloadSettings.addTestTakersMonitor }).forEach((_, i) => {
      loginIndex += 1;
      const prefix =
        unitDownloadSettings.addTestTakersMonitor > 1 ?
          `TL${(i + 1).toString().padStart(2, '0')}_` :
          'TL_';
      const loginElement = groupElement.ele({
        Login: {
          '@mode': 'monitor-group',
          '@name': `${prefix}${loginNames[loginIndex]}`
        }
      });
      if (!unitDownloadSettings.passwordLess) loginElement.att('pw', loginPasswords[loginIndex - 1]);
      if (unitDownloadSettings.monitorBookletVisibility) {
        loginElement.ele({
          ViewSettings: {
            monitorBookletVisibility: unitDownloadSettings.monitorBookletVisibility
          }
        });
      }
    });
    zip.addFile(
      `${bookletId}_testtaker.xml`,
      Buffer.from(testTakerXml.toString({ prettyPrint: true }))
    );
  }

  static generateCodeList(codeLen: number, codeCount: number): string[] {
    const codeCharacters = 'abcdefghprqstuvxyz';
    const codeNumbers = '2345679';
    return Array.from({ length: codeCount }).reduce<string[]>(list => {
      let newCode = '';
      do {
        newCode = '';
        let isNumber = false;
        do {
          newCode += isNumber ?
            codeNumbers.substr(
              Math.floor(codeNumbers.length * Math.random()),
              1
            ) :
            codeCharacters.substr(
              Math.floor(codeCharacters.length * Math.random()),
              1
            );
          isNumber = !isNumber;
        } while (newCode.length < codeLen);
      } while (list.indexOf(newCode) >= 0);
      return [...list, newCode];
    }, []);
  }
}
