import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceImportService } from './workspace-import.service';
import Workspace from '../entities/workspace.entity';
import { UnitService } from './unit.service';
import { UnitMetadataService } from './unit-metadata.service';
import { UnitDefinitionService } from './unit-definition.service';
import { UnitCommentService } from './unit-comment.service';
import { UnitRichNoteService } from './unit-rich-note.service';
import User from '../entities/user.entity';
import { FileIo } from '../interfaces/file-io.interface';

describe('WorkspaceImportService', () => {
  let service: WorkspaceImportService;
  let workspaceRepository: Repository<Workspace>;
  let unitService: UnitService;
  let unitMetadataService: UnitMetadataService;
  let unitDefinitionService: UnitDefinitionService;

  beforeEach(async () => {
    workspaceRepository = createMock<Repository<Workspace>>();
    unitService = createMock<UnitService>();
    unitMetadataService = createMock<UnitMetadataService>();
    unitDefinitionService = createMock<UnitDefinitionService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceImportService,
        { provide: getRepositoryToken(Workspace), useValue: workspaceRepository },
        { provide: UnitService, useValue: unitService },
        { provide: UnitMetadataService, useValue: unitMetadataService },
        { provide: UnitDefinitionService, useValue: unitDefinitionService },
        { provide: UnitCommentService, useValue: createMock<UnitCommentService>() },
        { provide: UnitRichNoteService, useValue: createMock<UnitRichNoteService>() }
      ]
    }).compile();

    service = module.get<WorkspaceImportService>(WorkspaceImportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFiles', () => {
    const user = { id: 1 } as User;
    const buildFile = (name: string, mime: string, content: string): FileIo => ({
      originalname: name,
      mimetype: mime,
      buffer: Buffer.from(content),
      fieldname: 'files',
      encoding: '7bit',
      size: content.length
    });
    const xmlUnit = (key: string) => `<Unit><Metadata><Id>${key}</Id><Label>L</Label></Metadata></Unit>`;
    const jsonIndex = (key: string, extra: object = {}) => JSON
      .stringify({ id: key, userInterface: { player: 'test-player' }, ...extra });

    it('should process upload', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile('test.xml', 'text/xml', xmlUnit('1'))
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.create).toHaveBeenCalled();
    });

    it('should prefer JSON over XML for the same unit key', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile('unit01.xml', 'text/xml', xmlUnit('UNIT01')),
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01'))
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.create).toHaveBeenCalledTimes(1);
    });

    // An export with test takers carries the Testcenter's booklet and test-taker files. Imported
    // back, the booklet became an empty unit and the test-taker file raised a warning (#1710).
    it('should pass over the booklet and test-taker files of an export', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile('export.zip/UNIT01.xml', 'text/xml', xmlUnit('UNIT01')),
        buildFile(
          'export.zip/booklet1.xml',
          'text/xml',
          '<Booklet><Metadata><Id>booklet1</Id><Label/></Metadata><Units><Unit id="UNIT01"/></Units></Booklet>'
        ),
        buildFile(
          'export.zip/booklet1_testtaker.xml',
          'text/xml',
          '<Testtakers><Metadata/><Group id="booklet1_group"/></Testtakers>'
        )
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.create).toHaveBeenCalledTimes(1);
      expect(unitService.create).toHaveBeenCalledWith(1, { key: 'UNIT01', name: 'L' }, user, true);
    });

    // A definition without a file of its own was dropped together with its variables (#1839).
    describe('with an inline definition', () => {
      beforeEach(() => {
        (unitService.create as jest.Mock).mockResolvedValue(10);
        (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
        (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);
      });

      it('should store the definition and the variables of an XML unit', async () => {
        const result = await service.uploadFiles(1, [
          buildFile('unit01.xml', 'text/xml', '<Unit><Metadata><Id>UNIT01</Id><Label>L</Label></Metadata>' +
            '<Definition player="p@1.0">{"content":1}</Definition>' +
            '<BaseVariables><Variable id="v1" type="string" format="" nullable="false" multiple="false"/>' +
            '</BaseVariables></Unit>')
        ], user);

        expect(result.messages).toHaveLength(0);
        expect(unitDefinitionService.patchDefinition).toHaveBeenCalledWith(
          10,
          expect.objectContaining({
            definition: '{"content":1}',
            variables: [expect.objectContaining({ id: 'v1', type: 'string' })]
          }),
          null,
          undefined
        );
      });

      it('should store the definition of a JSON unit', async () => {
        const result = await service.uploadFiles(1, [
          buildFile('unit01.json', 'application/json', JSON.stringify({
            id: 'UNIT01',
            userInterface: { player: 'p@1.0', definition: '{"content":1}', isDefinitionInline: true }
          }))
        ], user);

        expect(result.messages).toHaveLength(0);
        expect(unitDefinitionService.patchDefinition).toHaveBeenCalledWith(
          10,
          expect.objectContaining({ definition: '{"content":1}' }),
          null,
          undefined
        );
      });

      it('should not store an empty definition without a date', async () => {
        await service.uploadFiles(1, [
          buildFile('unit01.xml', 'text/xml', '<Unit><Metadata><Id>UNIT01</Id><Label>L</Label></Metadata>' +
            '<Definition player="p@1.0"/></Unit>')
        ], user);

        expect(unitDefinitionService.patchDefinition).not.toHaveBeenCalled();
      });
    });

    it('should still warn about an XML file that is neither a unit nor a Testcenter file', async () => {
      const result = await service.uploadFiles(1, [
        buildFile('other.xml', 'text/xml', '<Something><Metadata><Id>X</Id></Metadata></Something>')
      ], user);

      expect(unitService.create).not.toHaveBeenCalled();
      expect(result.messages).toEqual([{
        objectKey: 'other.xml',
        messageKey: 'unit-upload.api-warning.xml-parse'
      }]);
    });

    it('should report unreferenced JSON that is not a valid unit index as ignored', async () => {
      const result = await service.uploadFiles(1, [
        buildFile('broken.json', 'application/json', JSON.stringify({ notId: 'something' }))
      ], user);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].messageKey).toBe('unit-upload.api-warning.ignore-file');
    });

    it('should not warn for companion JSON files that are not unit indices', async () => {
      const result = await service.uploadFiles(1, [
        buildFile('unit01.vocs.json', 'application/json', JSON.stringify({ something: 'else' }))
      ], user);

      expect(result.messages.every(m => m.messageKey !== 'unit-upload.api-warning.json-parse')).toBe(true);
    });

    it('should import companion files with arbitrary names when the index references them', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitDefinitionService.patchScheme as jest.Mock).mockResolvedValue(undefined);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const schemeContent = JSON.stringify({ variableCodings: [] });
      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          codingScheme: { id: 'scheme.json', type: 'iqb-coding-scheme' }
        })),
        buildFile('scheme.json', 'application/json', schemeContent)
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitDefinitionService.patchScheme).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ scheme: schemeContent }),
        null,
        undefined
      );
    });

    it('should warn when definition file referenced in index is missing from upload', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile(
          'unit01.json',
          'application/json',
          jsonIndex('UNIT01', { userInterface: { player: 'p', definition: 'unit01.voud' } })
        )
      ], user);

      expect(result.messages.some(m => m.messageKey === 'unit-upload.api-warning.missing-file')).toBe(true);
    });

    it('should load baseVariables from vova.json before importing definition', async () => {
      const baseVariables = [{
        id: 'VAR1',
        type: 'string',
        format: 'text',
        nullable: false,
        multiple: false
      }];
      const vovaContent = JSON.stringify({ baseVariables, derivedVariables: [] });

      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitDefinitionService.patchDefinition as jest.Mock).mockResolvedValue(undefined);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          userInterface: { player: 'p', definition: 'unit01.voud' },
          variables: { id: 'unit01.vova.json', type: 'unit-variables' }
        })),
        buildFile('unit01.voud', 'application/octet-stream', '<definition/>'),
        buildFile('unit01.vova.json', 'application/json', vovaContent)
      ], user);

      expect(unitDefinitionService.patchDefinition).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ variables: baseVariables }),
        null,
        undefined
      );
    });

    it('should hand the definition type of the index on with the definition (#1368)', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitDefinitionService.patchDefinition as jest.Mock).mockResolvedValue(undefined);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          userInterface: { player: 'p', definition: 'unit01.voud', type: 'aspect-unit-definition@4.12.0' }
        })),
        buildFile('unit01.voud', 'application/octet-stream', '<definition/>')
      ], user);

      expect(unitDefinitionService.patchDefinition).toHaveBeenCalledWith(
        10,
        expect.objectContaining({
          definition: '<definition/>',
          definitionType: 'aspect-unit-definition@4.12.0'
        }),
        null,
        undefined
      );
    });

    it('should import vomd (unit-metadata@0.1) and voit (unit-items@0.2) files', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitMetadataService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const vomdContent = JSON.stringify({
        changedAt: '2026-05-01T08:00:00.000Z',
        metadata: [{
          profileId: 'https://example.org/unit-profile.json',
          entries: [{
            id: 'a1',
            label: [{ lang: 'de', value: 'Für SPF geeignet' }],
            value: { raw: 'false', asText: [{ lang: 'de', value: 'nein' }] }
          }]
        }]
      });
      const voitContent = JSON.stringify([{
        uuid: 'item-uuid-1',
        id: 'ITEM1',
        order: 0,
        sourceVariableId: 'VAR1',
        sourceVariableUuid: 'var-uuid-1'
      }]);

      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'unit-metadata@0.1' },
          items: { id: 'unit01.voit.json', type: 'unit-items@0.2' }
        })),
        buildFile('unit01.vomd.json', 'application/json', vomdContent),
        buildFile('unit01.voit.json', 'application/json', voitContent)
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitMetadataService.copyItemsWithMetadata).toHaveBeenCalledWith(10, {
        profiles: [{
          profileId: 'https://example.org/unit-profile.json',
          order: -1,
          entries: [{
            id: 'a1',
            label: [{ lang: 'de', value: 'Für SPF geeignet' }],
            value: 'false',
            valueAsText: [{ lang: 'de', value: 'nein' }]
          }]
        }],
        items: [{
          uuid: 'item-uuid-1',
          id: 'ITEM1',
          description: undefined,
          order: 0,
          variableId: 'VAR1',
          variableReadOnlyId: 'var-uuid-1',
          createdAt: undefined,
          changedAt: undefined,
          profiles: []
        }]
      });
    });

    it('should still import a legacy raw vomd blob with embedded items', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitMetadataService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const legacyVomd = JSON.stringify({
        profiles: [{ profileId: 'p1', isCurrent: true, entries: [] }],
        items: [{ id: 'ITEM1', variableId: 'VAR1', profiles: [] }]
      });

      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'metadata-values' }
        })),
        buildFile('unit01.vomd.json', 'application/json', legacyVomd)
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitMetadataService.copyItemsWithMetadata).toHaveBeenCalledWith(10, {
        profiles: [{ profileId: 'p1', order: -1, entries: [] }],
        items: [{ id: 'ITEM1', variableId: 'VAR1', profiles: [] }]
      });
    });

    it('should adopt the unit uuid from the index when present', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', { uuid: 'imported-unit-uuid' }))
      ], user);

      expect(unitService.adoptUuidIfFree).toHaveBeenCalledWith(10, 'imported-unit-uuid');
    });

    it('should not try to adopt a uuid when the index has none', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01'))
      ], user);

      expect(unitService.adoptUuidIfFree).not.toHaveBeenCalled();
    });

    it('should warn and continue when a companion JSON file is broken', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitMetadataService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'unit-metadata@0.1' },
          items: { id: 'unit01.voit.json', type: 'unit-items@0.2' }
        })),
        buildFile('unit01.vomd.json', 'application/json', '{ "metadata": broken !!!'),
        buildFile('unit01.voit.json', 'application/json', '[{ "id": "X", broken !!!')
      ], user);

      const parseWarnings = result.messages
        .filter(m => m.messageKey === 'unit-upload.api-warning.json-parse')
        .map(m => m.objectKey);
      expect(parseWarnings).toEqual(expect.arrayContaining(['unit01.vomd.json', 'unit01.voit.json']));
      expect(unitService.create).toHaveBeenCalledTimes(1);
      expect(unitMetadataService.copyItemsWithMetadata).not.toHaveBeenCalled();
    });

    it('should import remaining blocks when only one companion file is broken', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitMetadataService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const voitContent = JSON.stringify([{ id: 'ITEM1', sourceVariableId: 'VAR1' }]);
      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'unit-metadata@0.1' },
          items: { id: 'unit01.voit.json', type: 'unit-items@0.2' }
        })),
        buildFile('unit01.vomd.json', 'application/json', '{ broken'),
        buildFile('unit01.voit.json', 'application/json', voitContent)
      ], user);

      expect(result.messages.map(m => m.objectKey)).toEqual(['unit01.vomd.json']);
      expect(unitMetadataService.copyItemsWithMetadata).toHaveBeenCalledWith(10, expect.objectContaining({
        items: [expect.objectContaining({ id: 'ITEM1', variableId: 'VAR1' })]
      }));
    });

    it('should clear legacy items when the items file is legitimately empty', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitMetadataService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const legacyBlob = JSON.stringify({ profiles: [], items: [{ id: 'OLD' }] });
      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'metadata-values' },
          items: { id: 'unit01.voit.json', type: 'unit-items@0.2' }
        })),
        buildFile('unit01.vomd.json', 'application/json', legacyBlob),
        buildFile('unit01.voit.json', 'application/json', '[]')
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitMetadataService.copyItemsWithMetadata).toHaveBeenCalledWith(10, expect.objectContaining({
        items: []
      }));
    });

    it('should silently accept an export report file without creating units or warnings', async () => {
      const result = await service.uploadFiles(1, [
        buildFile('_export-report.json', 'application/json', JSON.stringify({
          messages: [{ unitKey: 'U1', messageKey: 'dropped-content.metadata-not-exported' }]
        }))
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.create).not.toHaveBeenCalled();
    });

    it('should warn when the items file referenced in the index is missing from the upload', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          items: { id: 'unit01.voit.json', type: 'unit-items@0.2' }
        }))
      ], user);

      expect(result.messages).toEqual([{
        objectKey: 'unit01.voit.json',
        messageKey: 'unit-upload.api-warning.missing-file'
      }]);
    });

    it('does not warn when imported vocabulary entries carry an annotation (it is now persisted)', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitMetadataService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const vomdContent = JSON.stringify({
        metadata: [{
          profileId: 'https://example.org/unit-profile.json',
          entries: [{
            id: 'a1',
            value: [{
              id: 'https://w3id.org/iqb/vocab/p2',
              label: [{ lang: 'de', value: 'Anwenden' }],
              annotation: [{ lang: 'de', value: '1.2' }]
            }]
          }]
        }]
      });
      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'unit-metadata@0.1' }
        })),
        buildFile('unit01.vomd.json', 'application/json', vomdContent)
      ], user);

      expect(result.messages.some(
        message => message.messageKey === 'unit-upload.api-warning.annotation-dropped'
      )).toBe(false);
    });

    it('should warn when coding scheme file referenced in index is missing from upload', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          codingScheme: { id: 'unit01.vocs.json', type: 'iqb-coding-scheme' }
        }))
      ], user);

      expect(result.messages.some(m => m.messageKey === 'unit-upload.api-warning.missing-file')).toBe(true);
    });
  });
});
