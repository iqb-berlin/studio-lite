import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

import { MatFormFieldModule } from '@angular/material/form-field';
import { By } from '@angular/platform-browser';
import { SelectModuleComponent } from './select-module.component';
import { VeronaModuleClass } from '../../models/verona-module.class';

const createModule = (
  id: string, name: string, version: string, isStable: boolean
): VeronaModuleClass => new VeronaModuleClass({
  key: id,
  sortKey: id,
  metadata: {
    id: id,
    name: name,
    version: version,
    specVersion: '1.0',
    isStable: isStable,
    label: name,
    description: ''
  },
  fileSize: 100,
  fileDateTime: 123456789
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

describe('SelectModuleComponent', () => {
  let component: SelectModuleComponent;
  let fixture: ComponentFixture<SelectModuleComponent>;

  const mockModules: { [key: string]: VeronaModuleClass } = {
    'mod-1': createModule('mod-1', 'Module One', '1.0.0', true),
    'mod-2': createModule('mod-2', 'Module Two', '2.0.0beta', false),
    'mod-3': createModule('mod-3', 'Module Three', '3.0.0', true),
    'mod-3.1': createModule('mod-3@1.1', 'Module Three', '1.1.0', true)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
        SelectModuleComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should set moduleList from modules input', () => {
      component.modules = mockModules;
      expect(component.moduleList.length).toBe(4);
      expect(component.hasListEntries).toBe(true);
    });

    it('should filter stable modules when stableOnly is true', () => {
      component.modules = mockModules;
      component.stableOnly = true;
      // mod-2 is unstable
      expect(component.moduleList.find(m => m.key === 'mod-2')).toBeUndefined();
      expect(component.moduleList.length).toBe(3);
    });

    it('should show unstable selected module even if stableOnly is true', () => {
      component.modules = mockModules;
      component.selectedModuleId = 'mod-2'; // pre-select unstable
      component.stableOnly = true;
      expect(component.moduleList.find(m => m.key === 'mod-2')).toBeDefined();
    });

    it('should update selection when value input changes', () => {
      component.modules = mockModules;
      component.value = 'mod-1';
      fixture.detectChanges();
      expect(component.moduleForm.get('moduleSelector')?.value).toBe('mod-1');
      expect(component.isValid).toBe(true);
      expect(component.isEmpty).toBe(false);
    });
  });

  describe('Validation Logic', () => {
    beforeEach(() => {
      component.modules = mockModules;
    });

    it('should be valid when selected module exists', () => {
      component.value = 'mod-1';
      expect(component.isValid).toBe(true);
      expect(component.moduleSubstitute).toBe('');
    });

    it('should be invalid when selected module does not exist and no substitute found', () => {
      component.value = 'unknown-module';
      expect(component.isValid).toBe(false);
      expect(component.moduleSubstitute).toBe('');
    });

    it('should find substitute for older version', () => {
      component.modules = {
        'editor@1.1': createModule('editor@1.1', 'Editor', '1.1', true)
      };
      component.value = 'editor@1.0';

      expect(component.isValid).toBe(true);
      expect(component.moduleSubstitute).toContain('Editor 1.1');
      expect(component.moduleForm.get('moduleSelector')?.value).toBe('');
    });
  });

  describe('Outputs', () => {
    it('should emit selectionChanged when form value changes', () => {
      jest.spyOn(component.selectionChanged, 'emit');
      component.modules = mockModules;
      component.moduleForm.setValue({ moduleSelector: 'mod-3' });
      expect(component.selectionChanged.emit).toHaveBeenCalledWith('mod-3');
    });
  });

  describe('View', () => {
    it('should display warning if invalid', () => {
      component.modules = mockModules;
      component.value = 'invalid-mod';
      fixture.detectChanges();
      const warning = fixture.debugElement.query(By.css('.smaller-font'));
      expect(warning).toBeTruthy();
      expect(component.isValid).toBe(false);
    });
  });
});
