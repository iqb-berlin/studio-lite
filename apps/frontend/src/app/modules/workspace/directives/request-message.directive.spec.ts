import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject, of, Observable } from 'rxjs';
import { RequestReportDto } from '@studio-lite-lib/api-dto';
import { RequestMessageDirective } from './request-message.directive';
import { RequestMessageComponent } from '../../../components/request-message/request-message.component';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceBackendService } from '../services/workspace-backend.service';

interface DialogRefLike {
  afterClosed: () => Observable<unknown>;
}

class TestRequestMessageDirective extends RequestMessageDirective {
  selectUnitDialog = {} as MatDialog;
  translateService: TranslateService;
  snackBar: MatSnackBar;
  uploadReportDialog: MatDialog;
  workspaceService = {} as WorkspaceService;
  router = {} as Router;
  route = {} as ActivatedRoute;
  ngUnsubscribe = new Subject<void>();
  backendService = {} as WorkspaceBackendService;

  updateUnitListSpy = jest.fn<void, [number?]>();

  constructor(
    translateService: TranslateService,
    snackBar: MatSnackBar,
    uploadReportDialog: MatDialog
  ) {
    super();
    this.translateService = translateService;
    this.snackBar = snackBar;
    this.uploadReportDialog = uploadReportDialog;
  }

  override updateUnitList(unitToSelect?: number): void {
    this.updateUnitListSpy(unitToSelect);
  }
}

describe('RequestMessageDirective', () => {
  let directive: TestRequestMessageDirective;
  let translateService: TranslateService;
  let snackBar: MatSnackBar;
  let uploadReportDialog: MatDialog;
  let dialogRef: DialogRefLike;

  beforeEach(() => {
    translateService = {
      instant: jest.fn((key: string) => key)
    } as unknown as TranslateService;
    snackBar = {
      open: jest.fn()
    } as unknown as MatSnackBar;
    dialogRef = {
      afterClosed: () => of(undefined)
    };
    uploadReportDialog = {
      open: jest.fn().mockReturnValue(dialogRef)
    } as unknown as MatDialog;

    directive = new TestRequestMessageDirective(
      translateService,
      snackBar,
      uploadReportDialog
    );
  });

  it('shows an error snackbar when uploadStatus is boolean', () => {
    directive.showRequestMessage(false, 'upload.error', 'upload.success');

    expect(snackBar.open).toHaveBeenCalledWith(
      'upload.error',
      'workspace.error',
      { duration: 3000 }
    );
    expect(uploadReportDialog.open).not.toHaveBeenCalled();
    expect(directive.updateUnitListSpy).not.toHaveBeenCalled();
  });

  it('opens the report dialog and refreshes the list when messages exist', () => {
    const report: RequestReportDto = {
      source: 'test',
      messages: [{ objectKey: 'obj', messageKey: 'msg' }]
    };

    directive.showRequestMessage(report, 'upload.error', 'upload.success');

    expect(uploadReportDialog.open).toHaveBeenCalledWith(RequestMessageComponent, {
      width: '500px',
      data: report
    });
    expect(snackBar.open).not.toHaveBeenCalled();
    expect(directive.updateUnitListSpy).toHaveBeenCalledTimes(1);
  });

  it('shows a success snackbar and refreshes the list when messages are empty', () => {
    const report: RequestReportDto = {
      source: 'test',
      messages: []
    };

    directive.showRequestMessage(report, 'upload.error', 'upload.success');

    expect(snackBar.open).toHaveBeenCalledWith(
      'upload.success',
      '',
      { duration: 5000 }
    );
    expect(uploadReportDialog.open).not.toHaveBeenCalled();
    expect(directive.updateUnitListSpy).toHaveBeenCalledTimes(1);
  });
});
