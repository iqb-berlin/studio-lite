import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UnitMetadataValues, UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { UnitDefinitionService } from './unit-definition.service';
import Unit from '../entities/unit.entity';
import UnitDefinition from '../entities/unit-definition.entity';

describe('UnitDefinitionService', () => {
  let service: UnitDefinitionService;
  let unitsRepository: DeepMocked<Repository<Unit>>;
  let unitDefinitionsRepository: DeepMocked<Repository<UnitDefinition>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitDefinitionService,
        {
          provide: getRepositoryToken(Unit),
          useValue: createMock<Repository<Unit>>()
        },
        {
          provide: getRepositoryToken(UnitDefinition),
          useValue: createMock<Repository<UnitDefinition>>()
        }
      ]
    }).compile();

    service = module.get<UnitDefinitionService>(UnitDefinitionService);
    unitsRepository = module.get(getRepositoryToken(Unit));
    unitDefinitionsRepository = module.get(getRepositoryToken(UnitDefinition));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOnesDefinition', () => {
    it('should return definition', async () => {
      unitsRepository.findOne.mockResolvedValue({ id: 1, workspaceId: 1 } as Unit);
      unitDefinitionsRepository.findOne.mockResolvedValue({ data: 'xml' } as UnitDefinition);

      const result = await service.findOnesDefinition(1);
      expect(result.definition).toBe('xml');
    });

    it('should return the stored definition type', async () => {
      unitsRepository.findOne.mockResolvedValue({ id: 1, workspaceId: 1 } as Unit);
      unitDefinitionsRepository.findOne.mockResolvedValue(
        { data: 'xml', type: 'aspect-unit-definition@4.12.0' } as UnitDefinition
      );

      const result = await service.findOnesDefinition(1);
      expect(result.definitionType).toBe('aspect-unit-definition@4.12.0');
    });

    it('should leave the definition type out when none is stored', async () => {
      unitsRepository.findOne.mockResolvedValue({ id: 1, workspaceId: 1 } as Unit);
      unitDefinitionsRepository.findOne.mockResolvedValue({ data: 'xml', type: null } as UnitDefinition);

      const result = await service.findOnesDefinition(1);
      expect(result).not.toHaveProperty('definitionType');
    });
  });

  describe('findOnesScheme', () => {
    // The schemer reads the variables from here and knows only the 1.x spelling (#1708).
    it('should hand out a variable list stored in 2.x in the 1.x spelling', async () => {
      const storedIn2x = {
        id: 'geo1',
        type: 'STRING',
        format: 'GGB_FILE',
        multiple: false,
        nullable: false,
        values: [],
        valuePositionLabels: []
      } as unknown as VariableInfo;
      unitsRepository.findOne.mockResolvedValue({ scheme: '{}', variables: [storedIn2x] } as Unit);

      const result = await service.findOnesScheme(1);

      expect(result.variables).toEqual([{
        ...storedIn2x, type: 'string', format: 'ggb-file', page: ''
      }]);
    });

    it('should keep a missing variable list missing', async () => {
      unitsRepository.findOne.mockResolvedValue({ scheme: '{}', variables: null } as Unit);
      const result = await service.findOnesScheme(1);
      expect(result.variables).toBeNull();
    });
  });

  describe('patchDefinition', () => {
    // Saving from the editor and importing both end up here. The list is stored in the spelling it
    // came in; readers that know only 1.x get it converted on the way out (#1708).
    it('should store a variable list in the spelling it was sent in', async () => {
      unitsRepository.findOne.mockResolvedValue({ id: 1 } as Unit);
      unitDefinitionsRepository.findOne.mockResolvedValue({ id: 1 } as UnitDefinition);
      const sentByA20Editor = {
        id: 'geo1',
        alias: 'geo1',
        type: 'STRING',
        format: 'GGB_FILE',
        multiple: false,
        nullable: false,
        values: [],
        valuePositionLabels: []
      } as unknown as VariableInfo;

      await service.patchDefinition(1, { definition: 'xml', variables: [sentByA20Editor] }, 'user', new Date());

      const stored = unitsRepository.save.mock.calls[0][0] as Unit;
      expect(stored.variables).toEqual([sentByA20Editor]);
    });

    // The frontend brings the items in line with the variables when it saves (#1361). The definition
    // names only the base variables, so an item of a derived variable lost it here (#1853).
    it('should leave the items in the stored metadata alone', async () => {
      const metadata = {
        items: [{ uuid: 'u-1', variableReadOnlyId: 'sum', variableId: 'Summe' }]
      } as unknown as UnitMetadataValues;
      unitsRepository.findOne.mockResolvedValue({ id: 1, metadata: structuredClone(metadata) } as Unit);
      unitDefinitionsRepository.findOne.mockResolvedValue({ id: 1 } as UnitDefinition);

      await service.patchDefinition(
        1,
        { definition: 'xml', variables: [{ id: 'text_1', alias: 'Antwort' } as VariableInfo] },
        'user',
        new Date()
      );

      const stored = unitsRepository.save.mock.calls[0][0] as Unit;
      expect(stored.metadata).toEqual(metadata);
    });

    // The type belongs to the definition it came with (#1368).
    describe('with a definition type', () => {
      const savedDefinition = () => unitDefinitionsRepository.save.mock.calls[0][0] as UnitDefinition;

      beforeEach(() => {
        unitsRepository.findOne.mockResolvedValue({ id: 1 } as Unit);
      });

      it('should store the type sent with a definition', async () => {
        unitDefinitionsRepository.findOne.mockResolvedValue({ id: 1, type: null } as UnitDefinition);

        await service.patchDefinition(
          1,
          { definition: 'xml', definitionType: 'aspect-unit-definition@4.12.0' },
          'user',
          new Date()
        );

        expect(savedDefinition().type).toBe('aspect-unit-definition@4.12.0');
      });

      it('should clear the stored type when a definition comes without one', async () => {
        unitDefinitionsRepository.findOne.mockResolvedValue(
          { id: 1, type: 'aspect-unit-definition@4.11.0' } as UnitDefinition
        );

        await service.patchDefinition(1, { definition: 'xml' }, 'user', new Date());

        expect(savedDefinition().type).toBeNull();
      });

      it('should leave the stored type alone when only the variables change', async () => {
        unitDefinitionsRepository.findOne.mockResolvedValue(
          { id: 1, type: 'aspect-unit-definition@4.11.0' } as UnitDefinition
        );

        await service.patchDefinition(
          1,
          { variables: [], definitionType: 'aspect-unit-definition@4.12.0' },
          'user',
          new Date()
        );

        // undefined is what TypeORM skips on save, so the column keeps its value
        expect(savedDefinition().type).toBeUndefined();
      });

      it('should store the type on a definition created by this call', async () => {
        unitDefinitionsRepository.findOne.mockResolvedValue(null);
        unitDefinitionsRepository.create.mockImplementation(entity => entity as UnitDefinition);

        await service.patchDefinition(
          1,
          { definition: 'xml', definitionType: 'aspect-unit-definition@4.12.0' },
          'user',
          new Date()
        );

        expect(unitDefinitionsRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'aspect-unit-definition@4.12.0', unitId: 1 })
        );
      });
    });
  });

  describe('patchScheme', () => {
    it('should save scheme', async () => {
      unitsRepository.findOne.mockResolvedValue({ id: 1 } as Unit);
      await service.patchScheme(
        1,
        { scheme: '{"variableCodings": []}', schemeType: 't' } as UnitSchemeDto,
        'user',
        new Date()
      );
      expect(unitsRepository.save).toHaveBeenCalled();
    });

    it.each(['{broken', 'null', '{}'])('should refuse the scheme %s without a list of codings', async scheme => {
      await expect(service.patchScheme(1, { scheme, schemeType: 't' }, 'user', new Date()))
        .rejects.toThrow(BadRequestException);
      expect(unitsRepository.save).not.toHaveBeenCalled();
    });
  });
});
