import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Component, Input } from '@angular/core';
import { SearchFilterComponent } from './search-filter.component';
import { WrappedIconComponent } from '../wrapped-icon/wrapped-icon.component';

describe('SearchFilterComponent', () => {
  let component: SearchFilterComponent;
  let fixture: ComponentFixture<SearchFilterComponent>;

  @Component({
    selector: 'studio-lite-wrapped-icon',
    template: '',
    standalone: true
  })
  class MockWrappedIconComponent {
    @Input() icon!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTooltipModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        TranslateModule.forRoot(),
        SearchFilterComponent
      ]
    }).overrideComponent(SearchFilterComponent, {
      remove: { imports: [WrappedIconComponent] },
      add: { imports: [MockWrappedIconComponent] }
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterComponent);
    component = fixture.componentInstance;
    component.title = 'Test Title';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title in mat-label', () => {
    const label = fixture.nativeElement.querySelector('mat-label');
    expect(label.textContent).toBe('Test Title');
  });

  it('should emit valueChange on input keyup', () => {
    jest.spyOn(component.valueChange, 'emit');
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'test filter';
    input.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();

    expect(component.value).toBe('test filter');
    expect(component.valueChange.emit).toHaveBeenCalledWith('test filter');
  });

  it('should clear value and emit on clear button click', () => {
    jest.spyOn(component.valueChange, 'emit');
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'some text';
    input.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('button');
    clearButton.click();
    fixture.detectChanges();

    expect(component.value).toBe('');
    expect(input.value).toBe('');
    expect(component.valueChange.emit).toHaveBeenCalledWith('');
  });

  it('should disable clear button when input is empty', () => {
    const clearButton = fixture.nativeElement.querySelector('button');
    expect(clearButton.disabled).toBe(true);

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'non-empty';
    input.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();

    expect(clearButton.disabled).toBe(false);
  });
});
