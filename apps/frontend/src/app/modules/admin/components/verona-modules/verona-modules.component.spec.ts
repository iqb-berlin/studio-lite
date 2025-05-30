// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Component, Directive, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { VeronaModulesComponent } from './verona-modules.component';

describe('VeronaModulesComponent', () => {
  let component: VeronaModulesComponent;
  let fixture: ComponentFixture<VeronaModulesComponent>;

  @Component({ selector: 'iqb-files-upload-queue', template: '', standalone: false })
  class MockIqbFilesUploadQueueComponent {
    @Input() uploadQueue!: unknown;
    @Input() httpUrl: unknown;
    @Input() httpRequestHeaders: unknown;
    @Input() httpRequestParams: unknown;
    @Input() fileAlias: unknown;
    @Input() tokenName: unknown;
    @Input() token: unknown;
    @Input() folderName: unknown;
    @Input() folder: unknown;
  }

  @Component({ selector: 'studio-lite-verona-modules-table', template: '', standalone: false })
  class MockVeronaModulesTableComponent {
    @Input() uploadQueue!: unknown;
    @Input() modules: unknown;
  }

  @Directive({ selector: 'input[iqbFilesUploadInputFor], div[iqbFilesUploadInputFor]', standalone: false })
  class MockIqbFilesUploadInputForDirective {
    @Input() iqbFilesUploadInputFor!: unknown;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockIqbFilesUploadInputForDirective,
        MockIqbFilesUploadQueueComponent,
        MockVeronaModulesTableComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        MatTooltipModule,
        MatSnackBarModule,
        MatIconModule,
        MatDialogModule
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VeronaModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
