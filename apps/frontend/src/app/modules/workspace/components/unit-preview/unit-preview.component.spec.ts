import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router, UrlCreationOptions, UrlTree } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { PreviewService } from '../../services/preview.service';
import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { UnitPreviewComponent } from './unit-preview.component';
import { PreviewBarComponent } from '../preview-bar/preview-bar.component';
import { PageData } from '../../models/page-data.interface';
import { Progress } from '../../models/types';

describe('UnitPreviewComponent', () => {
  let component: UnitPreviewComponent;
  let fixture: ComponentFixture<UnitPreviewComponent>;
  let snackBarStub: MatSnackBar;
  let dialogStub: MatDialog;
  let routerStub: Router;
  let workspaceServiceStub: WorkspaceService;
  let backendServiceStub: WorkspaceBackendService;

  @Component({ selector: 'studio-lite-preview-bar', template: '', standalone: true })
  class MockPreviewBarComponent {
    @Input() pageList!: PageData[];
    @Input() playerApiVersion!: number;
    @Input() postMessageTarget!: Window | undefined;
    @Input() playerName!: string;
    @Input() presentationProgress!: Progress;
    @Input() responseProgress!: Progress;
    @Input() hasFocus!: boolean;
  }

  beforeEach(async () => {
    snackBarStub = {
      open: jest.fn()
    } as unknown as MatSnackBar;

    dialogStub = {
      open: jest.fn()
    } as unknown as MatDialog;

    routerStub = {
      serializeUrl: jest.fn(),
      createUrlTree: jest.fn(),
      routerState: { snapshot: { url: '/a/1' } }
    } as unknown as Router;

    backendServiceStub = {
      getUnitScheme: jest.fn().mockReturnValue(of(null)),
      getDirectDownloadLink: jest.fn().mockReturnValue('direct')
    } as unknown as WorkspaceBackendService;

    workspaceServiceStub = {
      selectedUnit$: new BehaviorSubject<number>(5),
      selectedWorkspaceId: 7,
      groupId: 9,
      unitDefinitionStoreChanged: new Subject<void>(),
      isChanged: jest.fn().mockReturnValue(false),
      getUnitDefinitionStore: () => undefined,
      getUnitMetadataStore: () => undefined
    } as unknown as WorkspaceService;

    const previewServiceStub = {
      pagingMode: new BehaviorSubject<string>('linear')
    } as unknown as PreviewService;

    const moduleServiceStub = {} as ModuleService;
    const appServiceStub = { postMessage$: new Subject<MessageEvent>() } as unknown as AppService;

    await TestBed.configureTestingModule({
      imports: [
        UnitPreviewComponent,
        CommonModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        { provide: MatSnackBar, useValue: snackBarStub },
        { provide: MatDialog, useValue: dialogStub },
        { provide: Router, useValue: routerStub },
        { provide: WorkspaceBackendService, useValue: backendServiceStub },
        { provide: WorkspaceService, useValue: workspaceServiceStub },
        { provide: PreviewService, useValue: previewServiceStub },
        { provide: ModuleService, useValue: moduleServiceStub },
        { provide: AppService, useValue: appServiceStub },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .overrideComponent(UnitPreviewComponent, {
        remove: { imports: [PreviewBarComponent] },
        add: { imports: [MockPreviewBarComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UnitPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens a print view with computed query params', () => {
    const urlTree = {} as UrlTree;
    (routerStub.createUrlTree as jest.Mock).mockReturnValue(urlTree);
    (routerStub.serializeUrl as jest.Mock).mockReturnValue('/print?x=1');
    jest.spyOn(window, 'open').mockReturnValue(null);

    component.openPrintView([
      { key: 'printPreviewHeight', value: 400 },
      { key: 'metadata', value: true },
      { key: 'responses', value: false }
    ]);

    const args = (routerStub.createUrlTree as jest.Mock).mock.calls[0];
    const extras = args[1] as UrlCreationOptions;
    /* eslint-disable @typescript-eslint/dot-notation */
    expect(extras.queryParams?.['printPreviewHeight']).toBe(400);
    expect(extras.queryParams?.['printOptions']).toEqual(['metadata']);
    expect(extras.queryParams?.['unitIds']).toEqual([5]);
    expect(extras.queryParams?.['workspaceId']).toBe(7);
    expect(extras.queryParams?.['workspaceGroupId']).toBe(9);
    expect(window.open).toHaveBeenCalledWith('#/print?x=1', '_blank');
  });

  it('warns when coding is checked while changes exist', async () => {
    (workspaceServiceStub.isChanged as jest.Mock).mockReturnValue(true);

    await component.checkCodingChanged();

    expect(snackBarStub.open).toHaveBeenCalled();
    expect(backendServiceStub.getUnitScheme).not.toHaveBeenCalled();
  });

  it('loads coding scheme when no changes exist', async () => {
    (workspaceServiceStub.isChanged as jest.Mock).mockReturnValue(false);

    await component.checkCodingChanged();

    expect(backendServiceStub.getUnitScheme).toHaveBeenCalledWith(7, 5);
  });
});
