import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UnitsMenuComponent } from './units-menu.component';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';

describe('UnitsMenuComponent', () => {
  let component: UnitsMenuComponent;
  let fixture: ComponentFixture<UnitsMenuComponent>;

  @Component({ selector: 'studio-lite-wrapped-icon', template: '', standalone: true })
  class MockWrappedIconComponent {
    @Input() icon!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTooltipModule,
        MatIconModule,
        TranslateModule.forRoot(),
        UnitsMenuComponent,
        MockWrappedIconComponent
      ]
    })
      .overrideComponent(UnitsMenuComponent, {
        remove: { imports: [WrappedIconComponent] },
        add: { imports: [MockWrappedIconComponent] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit event on downloadUnits click', () => {
    const emitSpy = jest.spyOn(component.downloadUnits, 'emit');
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(emitSpy).toHaveBeenCalledWith(true);
  });
});
