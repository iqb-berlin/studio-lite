import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { UnitProfileComponent } from './unit-profile.component';

describe('UnitProfileComponent', () => {
  let component: UnitProfileComponent;
  let fixture: ComponentFixture<UnitProfileComponent>;

  @Component({ selector: 'formly-form', template: '' })
  class MockFormlyFormComponent {
    @Input() model!: any;
    @Input() fields!: FormlyFieldConfig[];
    @Input() form!: FormGroup;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitProfileComponent,
        MockFormlyFormComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatCardModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
