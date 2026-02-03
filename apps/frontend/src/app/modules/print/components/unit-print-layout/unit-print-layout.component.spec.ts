// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { UnitMetadataValues, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { UnitPrintLayoutComponent } from './unit-print-layout.component';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { PrintOption } from '../../models/print-options.interface';
import { environment } from '../../../../../environments/environment';

describe('UnitPrintLayoutComponent', () => {
  let component: UnitPrintLayoutComponent;
  let fixture: ComponentFixture<UnitPrintLayoutComponent>;
  let mockBackendService: { getUnitProperties: jest.Mock };
  let mockModuleService: { loadList: jest.Mock; players: Record<string, unknown> };
  let mockAppService: Record<string, unknown>;

  @Pipe({ name: 'include', standalone: false })
  class MockIncludePipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(): boolean {
      return true;
    }
  }

  @Component({ selector: 'studio-lite-unit-properties', template: '', standalone: false })
  class MockUnitMetaDataComponent {
    @Input() workspaceGroupId!: number;
    @Input() state!: string | undefined | null;
    @Input() name!: string | undefined | null;
    @Input() key!: string | undefined | null;
    @Input() description!: string | undefined | null;
    @Input() reference!: string | undefined | null;
    @Input() transcript!: string | undefined | null;
    @Input() groupName!: string | undefined | null;
    @Input() player!: string;
    @Input() editor!: string | undefined | null;
    @Input() schemer!: string | undefined | null;
    @Input() lastChangedDefinition!: Date | undefined | null;
    @Input() lastChangedMetadata!: Date | undefined | null;
    @Input() lastChangedScheme!: Date | undefined | null;
    @Input() lastChangedDefinitionUser!: string | undefined | null;
    @Input() lastChangedMetadataUser!: string | undefined | null;
    @Input() lastChangedSchemeUser!: string | undefined | null;
  }

  @Component({ selector: 'studio-lite-print-metadata', template: '', standalone: false })
  class MockUnitPrintMetaDateComponent {
    @Input() metadata!: UnitMetadataValues | null;
  }

  @Component({ selector: 'studio-lite-unit-print-comments', template: '', standalone: false })
  class MockUnitPrintCommentsComponent {
    @Input() unitId!: number;
    @Input() workspaceId!: number;
  }

  @Component({ selector: 'studio-lite-unit-print-coding', template: '', standalone: false })
  class MockUnitPrintCodingComponent {
    @Input() unitId!: number;
    @Input() workspaceId!: number;
  }

  @Component({ selector: 'studio-lite-unit-print-player', template: '', standalone: false })
  class MockUnitPrintPlayerComponent {
    @Input() unitId!: number;
    @Input() workspaceId!: number;
  }

  const createMockUnitProperties = (): UnitPropertiesDto => ({
    id: 1,
    key: 'unit-key',
    name: 'Test Unit',
    state: 'active',
    description: 'Test description',
    player: 'verona-player-simple@1.0.0',
    editor: 'verona-editor@1.0.0',
    schemer: 'verona-schemer@1.0.0'
  });

  beforeEach(async () => {
    mockBackendService = {
      getUnitProperties: jest.fn()
    };

    mockModuleService = {
      loadList: jest.fn().mockResolvedValue(undefined),
      players: {}
    };

    mockAppService = {};

    await TestBed.configureTestingModule({
      declarations: [
        MockUnitPrintMetaDateComponent,
        MockUnitMetaDataComponent,
        MockUnitPrintCommentsComponent,
        MockUnitPrintCodingComponent,
        MockUnitPrintPlayerComponent,
        MockIncludePipe
      ],
      imports: [UnitPrintLayoutComponent],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: WorkspaceBackendService,
          useValue: mockBackendService
        },
        {
          provide: ModuleService,
          useValue: mockModuleService
        },
        {
          provide: AppService,
          useValue: mockAppService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPrintLayoutComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call initPlayer', () => {
      const initPlayerSpy = jest.spyOn(component as never, 'initPlayer');

      component.ngOnInit();

      expect(initPlayerSpy).toHaveBeenCalled();
    });

    it('should initialize with default values', () => {
      expect(component.message).toBe('');
      expect(component.playerId).toBe('');
    });
  });

  describe('initPlayer', () => {
    it('should fetch unit properties', fakeAsync(() => {
      const mockProperties = createMockUnitProperties();
      mockBackendService.getUnitProperties.mockReturnValue(of(mockProperties));
      mockModuleService.players = { 'verona-player-simple@1.0.0': {} };

      component.workspaceId = 1;
      component.unitId = 10;
      component.ngOnInit();

      tick(0);

      expect(mockBackendService.getUnitProperties).toHaveBeenCalledWith(1, 10);
    }));

    it('should handle null unit properties', fakeAsync(() => {
      mockBackendService.getUnitProperties.mockReturnValue(of(null));

      component.workspaceId = 1;
      component.unitId = 10;
      component.ngOnInit();

      tick(0);

      expect(component.unitProperties).toBeUndefined();
    }));
  });

  describe('setUnitProperties', () => {
    it('should set unitProperties and playerId', fakeAsync(() => {
      const mockProperties = createMockUnitProperties();
      mockBackendService.getUnitProperties.mockReturnValue(of(mockProperties));
      mockModuleService.players = { 'verona-player-simple@1.0.0': {} };

      component.workspaceId = 1;
      component.unitId = 10;
      component.ngOnInit();

      tick(0);

      expect(component.unitProperties).toBeDefined();
    }));

    it('should load module list if players are empty', fakeAsync(() => {
      const mockProperties = createMockUnitProperties();
      mockBackendService.getUnitProperties.mockReturnValue(of(mockProperties));
      mockModuleService.players = {};

      component.workspaceId = 1;
      component.unitId = 10;
      component.ngOnInit();

      tick(0);

      expect(mockModuleService.loadList).toHaveBeenCalled();
    }));

    it('should not load module list if players already exist', fakeAsync(() => {
      const mockProperties = createMockUnitProperties();
      mockBackendService.getUnitProperties.mockReturnValue(of(mockProperties));
      mockModuleService.players = { player1: {} };

      component.workspaceId = 1;
      component.unitId = 10;
      component.ngOnInit();

      tick(0);

      expect(mockModuleService.loadList).not.toHaveBeenCalled();
    }));

    it('should handle unit properties without player', fakeAsync(() => {
      const mockProperties = createMockUnitProperties();
      mockProperties.player = undefined;
      mockBackendService.getUnitProperties.mockReturnValue(of(mockProperties));

      component.workspaceId = 1;
      component.unitId = 10;
      component.ngOnInit();

      tick(0);

      expect(component.playerId).toBe('');
    }));
  });

  describe('playerHeightChange', () => {
    it('should emit heightChange event with difference', () => {
      const emitSpy = jest.spyOn(component.heightChange, 'emit');
      component.printPreviewHeight = 500;

      component.playerHeightChange(700);

      expect(emitSpy).toHaveBeenCalledWith(200);
      expect(component.printPreviewHeight).toBe(700);
    });

    it('should handle negative height difference', () => {
      const emitSpy = jest.spyOn(component.heightChange, 'emit');
      component.printPreviewHeight = 500;

      component.playerHeightChange(300);

      expect(emitSpy).toHaveBeenCalledWith(-200);
      expect(component.printPreviewHeight).toBe(300);
    });

    it('should handle zero height change', () => {
      const emitSpy = jest.spyOn(component.heightChange, 'emit');
      component.printPreviewHeight = 500;

      component.playerHeightChange(500);

      expect(emitSpy).toHaveBeenCalledWith(0);
      expect(component.printPreviewHeight).toBe(500);
    });

    it('should update printPreviewHeight to new value', () => {
      component.printPreviewHeight = 100;

      component.playerHeightChange(250);

      expect(component.printPreviewHeight).toBe(250);
    });
  });

  describe('input properties', () => {
    it('should accept unitId input', () => {
      component.unitId = 42;
      expect(component.unitId).toBe(42);
    });

    it('should accept workspaceId input', () => {
      component.workspaceId = 5;
      expect(component.workspaceId).toBe(5);
    });

    it('should accept workspaceGroupId input', () => {
      component.workspaceGroupId = 10;
      expect(component.workspaceGroupId).toBe(10);
    });

    it('should accept printPreviewHeight input', () => {
      component.printPreviewHeight = 800;
      expect(component.printPreviewHeight).toBe(800);
    });

    it('should accept printOptions input', () => {
      const options: PrintOption[] = ['printProperties', 'printMetadata'];
      component.printOptions = options;
      expect(component.printOptions).toEqual(options);
    });
  });

  describe('output properties', () => {
    it('should have heightChange EventEmitter', () => {
      expect(component.heightChange).toBeDefined();
    });
  });
});
