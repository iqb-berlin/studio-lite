// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { BytesPipe } from '@studio-lite-lib/iqb-components';
import { VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { VeronaModulesTableComponent } from './verona-modules-table.component';
import { BackendService } from '../../services/backend.service';
import { I18nService } from '../../../../services/i18n.service';
import { IsSelectedPipe } from '../../../../pipes/is-selected.pipe';
import { IsAllSelectedPipe } from '../../../../pipes/is-all-selected.pipe';
import { HasSelectionValuePipe } from '../../../../pipes/has-selection-value.pipe';
import { FlattenedVeronaModuleClass, VeronaModuleClass } from '../../../../models/verona-module.class';

describe('VeronaModulesTableComponent', () => {
  let component: VeronaModulesTableComponent;
  let fixture: ComponentFixture<VeronaModulesTableComponent>;
  let mockBackendService: Partial<BackendService>;
  let mockI18nService: Partial<I18nService>;

  // Mock Pipes
  @Pipe({ name: 'isSelected', standalone: true })
  class MockIsSelectedPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(): boolean { return false; }
  }

  @Pipe({ name: 'isAllSelected', standalone: true })
  class MockIsAllSelectedPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(): boolean { return false; }
  }

  @Pipe({ name: 'hasSelectionValue', standalone: true })
  class MockHasSelectionValuePipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(): boolean { return false; }
  }

  @Pipe({ name: 'bytes', standalone: true })
  class MockBytesPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(): string { return '1 KB'; }
  }

  beforeEach(async () => {
    mockBackendService = {
      downloadModule: jest.fn().mockReturnValue(of(new Blob(['content'])))
    };
    mockI18nService = {
      // Mock any properties used by component or template if any.
      // Component constructor uses it but implementation doesn't seem to access it directly in methods shown?
      // Wait, template might use it? Or maybe constructor needs it.
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatTableModule,
        MatCheckboxModule,
        MatSortModule,
        VeronaModulesTableComponent,
        MockIsSelectedPipe,
        MockIsAllSelectedPipe,
        MockHasSelectionValuePipe,
        MockBytesPipe
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: BackendService, useValue: mockBackendService },
        { provide: I18nService, useValue: mockI18nService }
      ]
    })
      .overrideComponent(VeronaModulesTableComponent, {
        remove: {
          imports: [
            IsSelectedPipe,
            IsAllSelectedPipe,
            HasSelectionValuePipe,
            BytesPipe
          ]
        },
        add: {
          imports: [
            MockIsSelectedPipe,
            MockIsAllSelectedPipe,
            MockHasSelectionValuePipe,
            MockBytesPipe
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(VeronaModulesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set modules and update datasource', done => {
    component.modules = {
      m1: new VeronaModuleClass({
        key: 'm1',
        metadata: {
          id: 'id1',
          version: '1.0'
        }
      } as unknown as VeronaModuleInListDto) as unknown as VeronaModuleClass
    };

    setTimeout(() => {
      expect(component.objectsDatasource.data.length).toBe(1);
      expect(component.objectsDatasource.data[0].key).toBe('m1');
      done();
    });
  });

  it('should emit selectionChanged event when selection changes', () => {
    jest.spyOn(component.selectionChanged, 'emit');
    component.type = 'editor';
    const module = { key: 'm1', id: 'id1', version: '1.0' } as FlattenedVeronaModuleClass;

    // Simulate selection change
    component.tableSelectionCheckboxes.select(module);

    expect(component.selectionChanged.emit).toHaveBeenCalledWith(expect.objectContaining({
      type: 'editor',
      selectedModules: expect.any(Array)
    }));
  });

  it('should toggle all selection', () => {
    const module1 = { key: 'm1' } as FlattenedVeronaModuleClass;
    const module2 = { key: 'm2' } as FlattenedVeronaModuleClass;
    component.objectsDatasource.data = [module1, module2];

    // Select all
    component.masterToggleSelection();
    expect(component.tableSelectionCheckboxes.selected.length).toBe(2);

    // Deselect all
    component.masterToggleSelection();
    expect(component.tableSelectionCheckboxes.selected.length).toBe(0);
  });

  it('should download module', () => {
    // We need to mock saveAs? Or just check service call.
    // saveAs is imported from file-saver-es. Mocking it might be hard without jest.mock.
    // But we can check backend service call.
    component.downloadModule('m1', 'id1', '1.0');
    expect(mockBackendService.downloadModule).toHaveBeenCalledWith('m1');
  });
});
