import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { UnitPreviewComponent } from './unit-preview.component';
import { PageData } from '../../models/page-data.interface';
import { Progress } from '../../models/types';
import { PagingModeSelectionComponent } from '../paging-mode-selection/paging-mode-selection.component';

describe('UnitPreviewComponent', () => {
  let component: UnitPreviewComponent;
  let fixture: ComponentFixture<UnitPreviewComponent>;

  @Component({ selector: 'studio-lite-preview-bar', template: '' })
  class MockPreviewBarComponent {
    @Input() pageList!: PageData[];
    @Input() unitId!: number;
    @Input() playerApiVersion!: number;
    @Input() postMessageTarget!: Window | undefined;
    @Input() playerName!: string;
    @Input() presentationProgress!: Progress;
    @Input() responseProgress!: Progress;
    @Input() hasFocus!: boolean;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitPreviewComponent,
        MockPreviewBarComponent,
        PagingModeSelectionComponent
      ],
      imports: [
        HttpClientModule,
        MatSnackBarModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
