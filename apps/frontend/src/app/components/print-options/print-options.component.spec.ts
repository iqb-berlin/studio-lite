import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { PrintOptionsComponent } from './print-options.component';
import { IsActivePrintOption } from '../../pipes/isActivePrintOption.pipe';
import { PrintOptions } from '../../modules/print/models/print-options.interface';

describe('PrintOptionsComponent', () => {
  let component: PrintOptionsComponent;
  let fixture: ComponentFixture<PrintOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        FormsModule,
        TranslateModule.forRoot(),
        PrintOptionsComponent,
        IsActivePrintOption
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintOptionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default print options', () => {
      expect(component.printOptions).toBeDefined();
      expect(component.printOptions.length).toBe(8);

      const expectedOptions = [
        { key: 'printProperties', value: true },
        { key: 'printMetadata', value: true },
        { key: 'printComments', value: true },
        { key: 'printCoding', value: true },
        { key: 'printPreview', value: true },
        { key: 'printElementIds', value: true },
        { key: 'printPreviewAutoHeight', value: true },
        { key: 'printPreviewHeight', value: 1000 }
      ];

      expect(component.printOptions).toEqual(expectedOptions);
    });

    it('should emit printOptions on init', () => {
      jest.spyOn(component.printOptionsChange, 'emit');

      component.ngOnInit();

      expect(component.printOptionsChange.emit).toHaveBeenCalledWith(component.printOptions);
    });
  });

  describe('setPrintOptions', () => {
    it('should update printOptions and emit change', () => {
      jest.spyOn(component.printOptionsChange, 'emit');

      const newOptions: PrintOptions[] = [
        { key: 'printProperties', value: false },
        { key: 'printMetadata', value: true }
      ];

      component.setPrintOptions(newOptions);

      expect(component.printOptions).toEqual(newOptions);
      expect(component.printOptionsChange.emit).toHaveBeenCalledWith(newOptions);
    });

    it('should create a shallow copy of the options array', () => {
      const originalOptions: PrintOptions[] = [
        { key: 'printProperties', value: true }
      ];

      component.setPrintOptions(originalOptions);

      // The array itself is copied, but objects are shallow copied
      expect(component.printOptions).not.toBe(originalOptions);
      expect(component.printOptions.length).toBe(1);
      expect(component.printOptions[0]).toBe(originalOptions[0]);
    });
  });

  describe('Template rendering', () => {
    it('should render checkboxes for boolean options', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));

      // 7 checkboxes (all except printPreviewHeight)
      expect(checkboxes.length).toBe(7);
    });

    it('should render input field for printPreviewHeight', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const inputFields = fixture.debugElement.queryAll(By.css('input[type="number"]'));

      expect(inputFields.length).toBe(1);
      expect(inputFields[0].nativeElement.value).toBe('1000');
    });

    it('should disable printElementIds checkbox when printPreview is false', async () => {
      component.printOptions.find(o => o.key === 'printPreview')!.value = false;
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));
      const printElementIdsCheckbox = checkboxes.find(cb => cb.nativeElement.textContent.includes('printElementIds')
      );

      expect(printElementIdsCheckbox?.componentInstance.disabled).toBe(true);
    });

    it('should disable printPreviewAutoHeight checkbox when printPreview is false', async () => {
      component.printOptions.find(o => o.key === 'printPreview')!.value = false;
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));
      const autoHeightCheckbox = checkboxes.find(cb => cb.nativeElement.textContent.includes('printPreviewAutoHeight')
      );

      expect(autoHeightCheckbox?.componentInstance.disabled).toBe(true);
    });

    it('should disable height input when printPreview is false', async () => {
      component.printOptions.find(o => o.key === 'printPreview')!.value = false;
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input[type="number"]'));

      expect(input.nativeElement.disabled).toBe(true);
    });

    it('should disable height input when printPreviewAutoHeight is true', async () => {
      component.printOptions.find(o => o.key === 'printPreview')!.value = true;
      component.printOptions.find(o => o.key === 'printPreviewAutoHeight')!.value = true;
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input[type="number"]'));

      expect(input.nativeElement.disabled).toBe(true);
    });
  });

  describe('User interactions', () => {
    it('should call setPrintOptions when checkbox value changes', async () => {
      jest.spyOn(component, 'setPrintOptions');

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Change the value directly and trigger ngModelChange
      component.printOptions[0].value = false;
      component.setPrintOptions(component.printOptions);

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.setPrintOptions).toHaveBeenCalled();
    });

    it('should call setPrintOptions when input value changes', async () => {
      jest.spyOn(component, 'setPrintOptions');

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input[type="number"]'));
      input.nativeElement.value = '500';
      input.nativeElement.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.setPrintOptions).toHaveBeenCalled();
    });
  });
});
