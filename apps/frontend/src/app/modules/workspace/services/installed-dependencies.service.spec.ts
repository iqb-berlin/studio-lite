import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { InstalledDependenciesService } from './installed-dependencies.service';
import { InstalledDependencies } from '../utils/missing-dependencies.utils';
import { WorkspaceBackendService } from './workspace-backend.service';
import { ModuleService } from '../../../services/module.service';
import { VeronaModuleClass } from '../../../models/verona-module.class';

describe('InstalledDependenciesService', () => {
  let service: InstalledDependenciesService;
  let getResourcePackageNames: jest.Mock;
  let moduleService: { widgets: Record<string, VeronaModuleClass>; loadWidgets: jest.Mock };

  const calc = new VeronaModuleClass({
    key: 'calc@1.0',
    sortKey: 'calc@1.0',
    metadata: {
      id: 'calc', version: '1.0.0', model: 'CALC', type: 'WIDGET'
    }
  } as never);

  const loaded = (workspaceId: number): InstalledDependencies | undefined => {
    let installed: InstalledDependencies | undefined;
    service.load(workspaceId).subscribe(answer => {
      installed = answer;
    });
    tick();
    return installed;
  };

  beforeEach(() => {
    getResourcePackageNames = jest.fn().mockReturnValue(of(['GeoGebra']));
    moduleService = {
      widgets: {},
      // not async: fakeAsync controls only the promises zone.js patches
      loadWidgets: jest.fn(() => {
        moduleService.widgets = { 'calc@1.0': calc };
        return Promise.resolve(true);
      })
    };
    TestBed.configureTestingModule({
      providers: [
        InstalledDependenciesService,
        { provide: WorkspaceBackendService, useValue: { getResourcePackageNames } },
        { provide: ModuleService, useValue: moduleService }
      ]
    });
    service = TestBed.inject(InstalledDependenciesService);
  });

  it('gives the package names the workspace finds served and the installed widget types', fakeAsync(() => {
    expect(loaded(7)).toEqual({ packages: ['GeoGebra'], widgets: ['CALC'] });
    expect(getResourcePackageNames).toHaveBeenCalledWith(7);
  }));

  // which package serves a name depends on the workspace's group (#1358)
  it('asks once per workspace', fakeAsync(() => {
    loaded(7);
    loaded(7);
    getResourcePackageNames.mockReturnValue(of([]));

    expect(loaded(8)).toEqual({ packages: [], widgets: ['CALC'] });
    expect(getResourcePackageNames.mock.calls).toEqual([[7], [8]]);
    expect(moduleService.loadWidgets).toHaveBeenCalledTimes(1);
  }));

  it('does not keep a failed read of the packages, so that the next unit asks again', fakeAsync(() => {
    getResourcePackageNames.mockReturnValue(of(null));
    expect(loaded(7)).toEqual({ packages: null, widgets: ['CALC'] });

    getResourcePackageNames.mockReturnValue(of(['GeoGebra']));
    expect(loaded(7)).toEqual({ packages: ['GeoGebra'], widgets: ['CALC'] });
  }));

  // the failed request left the map empty, and every widget passed for not installed (#2198)
  it('does not take widgets that could not be read for none installed, nor keeps the read', fakeAsync(() => {
    moduleService.loadWidgets.mockResolvedValueOnce(false);
    expect(loaded(7)).toEqual({ packages: ['GeoGebra'], widgets: null });

    expect(loaded(7)).toEqual({ packages: ['GeoGebra'], widgets: ['CALC'] });
    expect(getResourcePackageNames).toHaveBeenCalledTimes(2);
  }));
});
