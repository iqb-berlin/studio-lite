import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyWrapperPanel } from './formly-wrapper-panel.component';

describe('FormlyWrapperPanel', () => {
  let component: FormlyWrapperPanel;
  let fixture: ComponentFixture<FormlyWrapperPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        FormlyModule.forRoot(),
        FormlyWrapperPanel
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyWrapperPanel);
    component = fixture.componentInstance;

    (component as unknown as { field: { props: Record<string, unknown>; model: Record<string, unknown> } }).field = {
      props: { label: 'Test Label' },
      model: {}
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
