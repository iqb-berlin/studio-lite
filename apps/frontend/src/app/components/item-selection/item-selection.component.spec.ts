import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSelect } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { ItemSelectionComponent } from './item-selection.component';

describe('ItemSelectionComponent', () => {
  let component: ItemSelectionComponent;
  let fixture: ComponentFixture<ItemSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemSelectionComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label', () => {
    component.label = 'My Label';
    fixture.detectChanges();
    const labelElement = fixture.debugElement.query(By.css('mat-label'));
    expect(labelElement.nativeElement.textContent).toBe('My Label');
  });

  it('should render unit items as options', async () => {
    component.unitItems = [
      { uuid: '1', id: 'Item 1' },
      { uuid: '2', id: '' }
    ] as UnitItemDto[];
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('mat-select'));
    select.nativeElement.click(); // Open the select
    fixture.detectChanges();
    await fixture.whenStable();

    const options = document.querySelectorAll('mat-option');
    expect(options.length).toBe(2);
    expect(options[0].textContent?.trim()).toBe('Item 1');
    expect(options[1].textContent?.trim()).toBe('metadata.without-id');
  });

  it('should be disabled when disabled input is true', () => {
    component.unitItems = [{ uuid: '1', id: 'Item 1' }] as UnitItemDto[];
    component.disabled = true;
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.css('mat-select')).componentInstance as MatSelect;
    expect(select.disabled).toBe(true);
  });

  it('should be disabled when unitItems is empty', () => {
    component.unitItems = [];
    component.disabled = false;
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.css('mat-select')).componentInstance as MatSelect;
    expect(select.disabled).toBe(true);
  });

  it('should be enabled when disabled is false and unitItems is not empty', () => {
    component.unitItems = [{ uuid: '1', id: 'Item 1' }] as UnitItemDto[];
    component.disabled = false;
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.css('mat-select')).componentInstance as MatSelect;
    expect(select.disabled).toBe(false);
  });

  it('should emit selectedItemsChange when selection changes', () => {
    const spy = jest.spyOn(component.selectedItemsChange, 'emit');
    component.unitItems = [{ uuid: '1', id: 'Item 1' }] as UnitItemDto[];
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('mat-select')).componentInstance as MatSelect;
    select.selectionChange.emit({ value: ['1'], source: select });
    expect(spy).toHaveBeenCalledWith(['1']);
  });
});
