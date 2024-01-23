// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Component, Input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ShowMetadataComponent } from './show-metadata.component';
import { environment } from '../../../../../environments/environment';

describe('ShowMetadataComponent', () => {
  let component: ShowMetadataComponent;
  let fixture: ComponentFixture<ShowMetadataComponent>;

  @Component({ selector: 'studio-lite-select-unit-list', template: '' })
  class MockSelectUnitListComponent {
    @Input() disabled!: number[];
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() workspace!: unknown;
    @Input() showGroups!: boolean;
    @Input() selectionCount!: number;
    @Input() selectedUnitId!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ShowMetadataComponent,
        MockSelectUnitListComponent
      ],
      imports: [
        MatDialogModule,
        HttpClientModule,
        MatExpansionModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
