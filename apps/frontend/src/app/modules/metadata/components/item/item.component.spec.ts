import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormlyModule } from '@ngx-formly/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { ItemsMetadataValues } from '@studio-lite-lib/api-dto';
import { ItemComponent } from './item.component';
import { environment } from '../../../../../environments/environment';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;

  @Component({ selector: 'studio-lite-profile-form', template: '' })
  class MockProfileFormComponent {
    @Input() language!: string;
    @Input() profileUrl!: string | undefined;
    @Input() metadataKey!: 'profiles' | 'items';
    @Input() metadata!: ItemsMetadataValues[];
    @Input() formlyWrapper!: string;
    @Input() panelExpanded!: boolean;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockProfileFormComponent
      ],
      imports: [
        MatExpansionModule,
        HttpClientModule,
        FormlyModule.forRoot(),
        BrowserAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.metadata = [];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
