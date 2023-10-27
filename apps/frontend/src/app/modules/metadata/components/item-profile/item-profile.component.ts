import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';

@Component({
  selector: 'studio-lite-item-profile',
  templateUrl: './item-profile.component.html',
  styleUrls: ['./item-profile.component.scss']
})
export class ItemProfileComponent implements OnInit {
  @Input() items!: string[];

  form = new FormGroup({});
  fields!: FormlyFieldConfig[];
  model: any = {};
  options: FormlyFormOptions = {};

  ngOnInit(): void {
    this.fields = [
      {
        key: 'items',
        type: 'repeat',
        props: {
          addText: 'Item-Variable hinzufügen',
          label: 'Item Variablen bearbeiten'
        },
        fieldArray: {
          fieldGroup: [
            {
              type: 'input',
              props: {
                placeholder: 'Task name',
                required: true
              }
            },
            {
              type: 'select',
              props: {
                label: 'Select',
                placeholder: 'Placeholder',
                description: 'Description',
                required: true,
                options: this.items.map(item => ({ value: item, label: item }))
              }
            }
          ]
        }
      }
    ];
  }
}
