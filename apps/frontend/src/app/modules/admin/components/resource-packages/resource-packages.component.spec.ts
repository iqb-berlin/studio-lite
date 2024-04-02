// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CUSTOM_ELEMENTS_SCHEMA, Directive, Input, Pipe, PipeTransform
} from '@angular/core';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../../../../../environments/environment';
import { ResourcePackagesComponent } from './resource-packages.component';

describe('ResourcePackageComponent', () => {
  let component: ResourcePackagesComponent;
  let fixture: ComponentFixture<ResourcePackagesComponent>;

  @Pipe({ name: 'tableDataSource' })
  class MockTableDataSourcePipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(): MatTableDataSource<ResourcePackageDto> {
      return new MatTableDataSource();
    }
  }

  @Directive({ selector: 'input[iqbFilesUploadInputFor], div[iqbFilesUploadInputFor]' })
  class MockIqbFilesUploadInputForDirective {
    @Input() iqbFilesUploadInputFor!: unknown;
    // eslint-disable-next-line class-methods-use-this
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockTableDataSourcePipe,
        MockIqbFilesUploadInputForDirective
      ],
      imports: [
        TranslateModule.forRoot(),
        HttpClientModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
