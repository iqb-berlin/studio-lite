import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ResourcePackageChoice } from '@studio-lite/shared-code';
import { ResourcePackageChoiceComponent } from './resource-package-choice.component';
import { BackendService } from '../../../../services/backend.service';

describe('ResourcePackageChoiceComponent', () => {
  const installed = (name: string, packageName: string): ResourcePackageDto => (
    {
      id: 0, name, packageName, elements: []
    }
  );

  const create = (choice?: ResourcePackageChoice) => {
    TestBed.configureTestingModule({
      imports: [ResourcePackageChoiceComponent, TranslateModule.forRoot()],
      providers: [{
        provide: BackendService,
        useValue: {
          getResourcePackages: () => of([
            installed('GeoGebra-5.3', 'GeoGebra'), installed('GeoGebra-5.0.791', 'GeoGebra'),
            installed('avatar', 'avatar')
          ]),
          getResourcePackageDefaults: () => of({ GeoGebra: 'GeoGebra-5.0.791' })
        }
      }]
    });
    const fixture = TestBed.createComponent(ResourcePackageChoiceComponent);
    fixture.componentRef.setInput('choice', choice);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should offer only package names several packages stand in for, with the default they give (#1358)', () => {
    const component = create();

    expect(component.entries()).toEqual([{
      packageName: 'GeoGebra',
      names: ['GeoGebra-5.0.791', 'GeoGebra-5.3'],
      chosen: '',
      defaultName: 'GeoGebra-5.0.791'
    }]);
  });

  it('should show the package the group chose', () => {
    expect(create({ geogebra: 'GeoGebra-5.3' }).entries()[0].chosen).toBe('GeoGebra-5.3');
  });

  it('should hand on the choice of a package, and drop it when the default is chosen again', () => {
    const component = create({ GeoGebra: 'GeoGebra-5.3', avatar: 'x' });
    const emitted: ResourcePackageChoice[] = [];
    component.choiceChange.subscribe(choice => emitted.push(choice));

    component.select('GeoGebra', 'GeoGebra-5.0.791');
    component.select('GeoGebra', '');

    expect(emitted).toEqual([{ avatar: 'x', GeoGebra: 'GeoGebra-5.0.791' }, { avatar: 'x' }]);
  });
});
