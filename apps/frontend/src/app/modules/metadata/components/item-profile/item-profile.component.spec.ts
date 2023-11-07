import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import {
  FormArray, FormGroup, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { BehaviorSubject } from 'rxjs';
import { ItemProfileComponent } from './item-profile.component';

describe('ItemProfileComponent', () => {
  let component: ItemProfileComponent;
  let fixture: ComponentFixture<ItemProfileComponent>;

  @Component({ selector: 'formly-form', template: '' })
  class MockFormlyFormComponent {
    @Input() model!: any;
    @Input() fields!: FormlyFieldConfig;
    @Input() form!: FormGroup | FormArray;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ItemProfileComponent,
        MockFormlyFormComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatCardModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemProfileComponent);
    component = fixture.componentInstance;
    component.itemsLoader = new BehaviorSubject<string[]>([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
