import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormlyModule } from '@ngx-formly/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { ItemComponent } from './item.component';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;

  @Component({ selector: 'studio-lite-profile-form', template: '' })
  class MockProfileFormComponent {
    @Input() language!: string;
    @Input() profileUrl!: string | undefined;
    @Input() metadataKey!: 'profiles' | 'items';
    @Input() metadata!: any;
    @Input() formlyWrapper!: string;
    @Input() panelExpanded!: boolean;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ItemComponent,
        MockProfileFormComponent
      ],
      imports: [
        MatExpansionModule,
        FormlyModule.forRoot(),
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.metadata = {};
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
