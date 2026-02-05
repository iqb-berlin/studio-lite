// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { PrintUnitsDialogComponent } from './print-units-dialog.component';
import { WorkspaceService } from '../../services/workspace.service';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { PrintOptionsComponent } from '../../../shared/components/print-options/print-options.component';
import { PrintOptions } from '../../../print/models/print-options.interface';

@Component({ selector: 'studio-lite-select-unit-list', template: '', standalone: true })
class MockSelectUnitListComponent {
  @Input() selectedUnitIds!: number[];
  @Input() unitIds: number[] = [];
  @Input() filter!: number[];
  @Input() initialSelection!: number[];
  @Input() workspace!: number;
  @Input() selectedUnitId!: number;
}

@Component({ selector: 'studio-lite-print-options', template: '', standalone: true })
class MockPrintOptionsComponent {}

describe('PrintUnitsDialogComponent', () => {
  let component: PrintUnitsDialogComponent;
  let fixture: ComponentFixture<PrintUnitsDialogComponent>;

  const mockWorkspaceService = {
    selectedWorkspaceId: 1,
    selectedUnit$: { value: 1 }
  };

  const mockData = {
    units: [1, 2]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintUnitsDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: WorkspaceService, useValue: mockWorkspaceService }
      ]
    })
      .overrideComponent(PrintUnitsDialogComponent, {
        remove: { imports: [SelectUnitListComponent, PrintOptionsComponent] },
        add: { imports: [MockSelectUnitListComponent, MockPrintOptionsComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PrintUnitsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set print settings correctly', () => {
    // Mocking PrintOption structure based on usage
    const options: PrintOptions[] = [
      { key: 'printPreviewHeight', value: 100 },
      { key: 'printProperties', value: true },
      { key: 'printComments', value: false }
    ];
    component.setPrintSettings(options);

    expect(component.unitPrintSettings.printPreviewHeight).toBe(100);
    // Accessing private property or just checking logic
    expect(component.unitPrintSettings.printOptions).toContain('printProperties');
    expect(component.unitPrintSettings.printOptions).not.toContain('printComments');
  });
});
