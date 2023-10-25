import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import {
  FormArray, FormGroup, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatCardModule } from '@angular/material/card';
import { BehaviorSubject } from 'rxjs';
import { MetadataComponent } from './metadata.component';

describe('MetadataComponent', () => {
  let component: MetadataComponent;
  let fixture: ComponentFixture<MetadataComponent>;

  @Component({ selector: 'formly-form', template: '' })
  class MockFormlyFormComponent {
    @Input() model!: any;
    @Input() fields!: FormlyFieldConfig;
    @Input() form!: FormGroup | FormArray;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MetadataComponent,
        MockFormlyFormComponent
      ],
      imports: [
        MatCardModule,
        FormsModule,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataComponent);
    component = fixture.componentInstance;
    component.metadataLoader = new BehaviorSubject<any>({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
