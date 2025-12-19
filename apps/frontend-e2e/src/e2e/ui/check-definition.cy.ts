import { createBasicSpecCy, deleteBasicSpecCy } from './shared/basic.spec.cy';
import { ws1 } from '../../support/testData';
import {
  clickIndexTabWorkspace,
  importExercise,
  selectUnit
} from '../../support/util';

describe('Definition:', () => {
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
  });

  it('should import the units to test', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('should click definition of a unit', () => {
    selectUnit('M6_AK0011');
    clickIndexTabWorkspace('editor');
  });

  it('should click from one definition to another five times', () => {
    selectUnit('M6_AK0011');
    selectUnit('M6_AK0012');
    selectUnit('M6_AK0011');
    selectUnit('M6_AK0012');
    selectUnit('M6_AK0011');
  });

  it('checks that the definition are replaced', () => {
    cy.pause();
  });
});
