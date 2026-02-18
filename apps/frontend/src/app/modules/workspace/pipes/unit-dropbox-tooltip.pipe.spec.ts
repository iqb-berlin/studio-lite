import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { UnitDropBoxTooltipPipe } from './unit-dropbox-tooltip.pipe';

describe('UnitDropBoxTooltipPipe', () => {
  let pipe: UnitDropBoxTooltipPipe;
  let translateService: TranslateService;

  beforeEach(async () => {
    const translateServiceMock = {
      instant: jest.fn((key: string) => {
        const translations: { [key: string]: string } = {
          'workspace.returned-unit': 'Unit has been returned',
          'workspace.submitted-unit': 'Unit has been submitted'
        };
        return translations[key] || key;
      })
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: TranslateService, useValue: translateServiceMock }
      ]
    });

    translateService = TestBed.inject(TranslateService);
    pipe = new UnitDropBoxTooltipPipe(translateService);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string when unit has no sourceWorkspaceId', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      sourceWorkspaceId: undefined,
      returned: false
    };

    expect(pipe.transform(unit)).toBe('');
  });

  it('should return "workspace.returned-unit" translation when unit is returned', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      sourceWorkspaceId: 5,
      returned: true
    };

    const result = pipe.transform(unit);

    expect(result).toBe('Unit has been returned');
    expect(translateService.instant).toHaveBeenCalledWith('workspace.returned-unit');
  });

  it('should return "workspace.submitted-unit" translation when unit is not returned', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      sourceWorkspaceId: 5,
      returned: false
    };

    const result = pipe.transform(unit);

    expect(result).toBe('Unit has been submitted');
    expect(translateService.instant).toHaveBeenCalledWith('workspace.submitted-unit');
  });

  it('should return "workspace.submitted-unit" translation when returned is undefined', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      sourceWorkspaceId: 5,
      returned: undefined
    };

    const result = pipe.transform(unit);

    expect(result).toBe('Unit has been submitted');
    expect(translateService.instant).toHaveBeenCalledWith('workspace.submitted-unit');
  });

  it('should return empty string when sourceWorkspaceId is 0', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      sourceWorkspaceId: 0,
      returned: false
    };

    expect(pipe.transform(unit)).toBe('');
  });

  it('should handle unit with sourceWorkspaceId and various returned states', () => {
    const unitWithReturn: UnitInListDto = {
      id: 1,
      key: 'unit1',
      sourceWorkspaceId: 10,
      returned: true
    };

    const unitWithoutReturn: UnitInListDto = {
      id: 2,
      key: 'unit2',
      sourceWorkspaceId: 10,
      returned: false
    };

    expect(pipe.transform(unitWithReturn)).toBe('Unit has been returned');
    expect(pipe.transform(unitWithoutReturn)).toBe('Unit has been submitted');
  });

  it('should call translateService.instant with correct key', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      sourceWorkspaceId: 5,
      returned: true
    };

    jest.spyOn(translateService, 'instant');
    pipe.transform(unit);

    expect(translateService.instant).toHaveBeenCalledTimes(1);
    expect(translateService.instant).toHaveBeenCalledWith('workspace.returned-unit');
  });
});
