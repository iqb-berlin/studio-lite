import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormlyModule } from '@ngx-formly/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TableViewComponent } from './table-view.component';
import { environment } from '../../../../../environments/environment';

describe('TableViewComponent', () => {
  let component: TableViewComponent;
  let fixture: ComponentFixture<TableViewComponent>;

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
        TableViewComponent,
        MockProfileFormComponent
      ],
      providers: [
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }, {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ],
      imports: [
        MatExpansionModule,
        FormlyModule.forRoot(),
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        HttpClientModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TableViewComponent);
    component = fixture.componentInstance;
    component.metadata = {};
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
