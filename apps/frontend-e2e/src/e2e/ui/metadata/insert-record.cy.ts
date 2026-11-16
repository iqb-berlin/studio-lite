import type { UnitMetadataValues, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import {
  getItem,
  getStructure,
  selectProfileForArea,
  selectProfileForAreaFromGroup,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import {
  AccessLevel,
  baseGroup,
  primaryWorkspace,
  secondaryWorkspace,
  UnitData
} from '../../../support/testData';
import { IqbProfile, IqbProfileExamples } from '../../../support/metadata/iqbProfile';
import { waitForSuccess } from '../../../support/helpers';
import { createGroupAdminBaseAPI } from '../../../support/helpers/test-base';

describe('Metadata Management', () => {
  const germanArea = primaryWorkspace;
  const mathArea = secondaryWorkspace;
  const group = baseGroup;
  const germanUnit: UnitData = { shortname: 'D1_001', name: 'Deutsch', group: '' };
  const mathUnit: UnitData = { shortname: 'M1_001', name: 'Mathematik', group: '' };
  let token = '';
  let germanAreaId = '';
  let mathAreaId = '';
  let germanUnitId = '';
  let mathUnitId = '';

  /** The metadata the API holds of a unit, to read back what the interface saved */
  const storedMetadata = (wsId: string, unitId: string): Cypress.Chainable<UnitMetadataValues> => cy
    .getUnitPropertiesAPI(wsId, unitId, token)
    .then(resp => {
      expect(resp.status, 'unit properties').to.equal(200);
      return (resp.body as UnitPropertiesDto).metadata || {};
    });

  /** The texts stored for the developer of the unit, a field of the unit profile */
  const storedDeveloper = (metadata: UnitMetadataValues): string[] => [
    (metadata.profiles || [])
      .flatMap(profile => profile.entries || [])
      .find(entry => entry.label.some(label => label.value === 'Entwickler:in'))?.valueAsText || []
  ].flat().map(text => text.value);

  before(() => {
    createGroupAdminBaseAPI({ users: [], firstUserAccess: AccessLevel.Admin }).then(base => {
      token = base.token;
      germanAreaId = base.wsId;
      mathAreaId = base.secondaryWsId;
      cy.createUnitAPI(germanAreaId, germanUnit, token).then(created => {
        expect(created.status, germanUnit.shortname).to.equal(201);
        germanUnitId = String(created.body);
      });
      cy.createUnitAPI(mathAreaId, mathUnit, token).then(created => {
        expect(created.status, mathUnit.shortname).to.equal(201);
        mathUnitId = String(created.body);
      });
    });
  });

  it('selects metadata profiles for group', () => {
    selectProfileForGroup(group, IqbProfile.DEu);
    selectProfileForGroup(group, IqbProfile.DEi);
    selectProfileForGroup(group, IqbProfile.MAu);
    selectProfileForGroup(group, IqbProfile.MAi);
  });

  it('assigns profiles to workspaces from group settings', () => {
    selectProfileForAreaFromGroup([IqbProfile.DEu, IqbProfile.DEi], germanArea, group);
    selectProfileForAreaFromGroup([IqbProfile.MAu, IqbProfile.DEi], mathArea, group);
  });

  it('assigns profile from workspace settings', () => {
    cy.visitWs(germanArea);
    selectProfileForArea([IqbProfile.DEu, IqbProfile.DEi]);
    cy.visitWs(mathArea);
    selectProfileForArea([IqbProfile.MAu, IqbProfile.MAi]);
  });

  it('adds metadata to math unit', () => {
    cy.intercept({ method: 'GET', pathname: '/api/metadata/vocabularies' }).as('vocabs');
    cy.visitWs(mathArea);
    cy.contains(mathUnit.shortname).should('exist').click();
    cy.wait('@vocabs');
    cy.wait('@vocabs');
    getStructure('uMA', false);
    getItem('iMA', false);
    cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveMathMetadata');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
    waitForSuccess('@saveMathMetadata');

    storedMetadata(mathAreaId, mathUnitId).then(metadata => {
      expect(storedDeveloper(metadata), 'developer of the unit')
        .to.deep.equal([IqbProfileExamples.get('uMA').get('Entwickler:in')]);
      expect(metadata.items, 'items').to.have.length(1);
      expect(metadata.items?.[0]).to.include({
        id: IqbProfileExamples.get('iMA').get('Item ID'),
        description: IqbProfileExamples.get('iMA').get('Notiz')
      });
    });
  });

  it('adds metadata with multiple items to German unit', () => {
    cy.intercept({ method: 'GET', pathname: '/api/metadata/vocabularies' }).as('vocabs');
    cy.visitWs(germanArea);
    cy.contains(germanUnit.shortname).should('exist').click();
    cy.wait('@vocabs');
    cy.wait('@vocabs');
    getStructure('uDE', false);
    getItem('iDE', false);
    getItem('iDE', true);
    getItem('iDE', true, 'iDE');
    // The copy appears once its dialog has closed; a save sent before would go without it.
    cy.get('studio-lite-item').should('have.length', 3);
    cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveGermanMetadata');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
    waitForSuccess('@saveGermanMetadata');

    storedMetadata(germanAreaId, germanUnitId).then(metadata => {
      expect(storedDeveloper(metadata), 'developer of the unit')
        .to.deep.equal([IqbProfileExamples.get('uDE').get('Entwickler:in')]);
      // Two items entered and a copy of one of them: it takes the profile values of its source,
      // but not its id.
      const items = metadata.items || [];
      const itemId = IqbProfileExamples.get('iDE').get('Item ID');
      expect(items.map(item => item.id || ''), 'item ids').to.have.members([itemId, itemId, '']);
      const source = items.find(item => item.id);
      const copy = items.find(item => !item.id);
      expect(source?.profiles?.[0]?.entries?.length, 'profile values of an item').to.be.greaterThan(0);
      expect(copy?.profiles?.[0]?.entries, 'profile values of the copy')
        .to.deep.equal(source?.profiles?.[0]?.entries);
    });
  });
});
