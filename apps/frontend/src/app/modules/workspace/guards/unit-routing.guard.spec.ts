import {
  BehaviorSubject, firstValueFrom, Observable, of
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { UnitRoutingCanDeactivateGuard } from './unit-routing.guard';
import { WorkspaceService } from '../services/workspace.service';
import { ConfirmDialogData } from '../models/confirm-dialog.interface';

type DialogResult = false | 'NO' | 'YES' | 'MAYBE' | null | undefined;

type DialogConfig = {
  width?: string;
  data?: ConfirmDialogData;
};

type DialogRefLike = {
  afterClosed: () => Observable<DialogResult>;
};

describe('UnitRoutingCanDeactivateGuard', () => {
  let guard: UnitRoutingCanDeactivateGuard;
  let confirmDialog: { open: jest.Mock<DialogRefLike, [unknown, DialogConfig]> };
  let snackBar: { open: jest.Mock<void, [string, string, { duration: number }]> };
  let workspaceService: {
    isChanged: jest.Mock<boolean, []>;
    userAccessLevel: number;
    isValidFormKey: BehaviorSubject<boolean>;
    saveUnitData: jest.Mock<Promise<boolean>, []>;
  };
  let translateService: { instant: jest.Mock<string, [string]> };

  const createDialogRef = (result: DialogResult): DialogRefLike => ({
    afterClosed: () => of(result)
  });

  const isObservable = (value: unknown): value is Observable<boolean> => {
    if (!value || typeof value !== 'object') return false;
    return 'subscribe' in value;
  };

  const isPromise = (value: unknown): value is Promise<boolean> => {
    if (!value || typeof value !== 'object') return false;
    return 'then' in value;
  };

  const getResult = async (): Promise<boolean> => {
    const result = guard.canDeactivate();
    if (typeof result === 'boolean') return result;
    if (isObservable(result)) return firstValueFrom(result);
    if (isPromise(result)) return result;
    return false;
  };

  beforeEach(() => {
    confirmDialog = {
      open: jest.fn()
    };
    snackBar = {
      open: jest.fn()
    };
    workspaceService = {
      isChanged: jest.fn(() => true),
      userAccessLevel: 2,
      isValidFormKey: new BehaviorSubject<boolean>(true),
      saveUnitData: jest.fn(async () => true)
    };
    translateService = {
      instant: jest.fn((key: string) => key)
    };

    guard = new UnitRoutingCanDeactivateGuard(
      confirmDialog as unknown as MatDialog,
      snackBar as unknown as MatSnackBar,
      workspaceService as unknown as WorkspaceService,
      translateService as unknown as TranslateService
    );
  });

  it('allows navigation when nothing changed', async () => {
    workspaceService.isChanged.mockReturnValue(false);

    await expect(getResult()).resolves.toBe(true);
    expect(confirmDialog.open).not.toHaveBeenCalled();
  });

  it('allows navigation when access level is too low', async () => {
    workspaceService.userAccessLevel = 1;

    await expect(getResult()).resolves.toBe(true);
    expect(confirmDialog.open).not.toHaveBeenCalled();
  });

  it('returns false when dialog result is false', async () => {
    confirmDialog.open.mockReturnValue(createDialogRef(false));

    await expect(getResult()).resolves.toBe(false);
  });

  it('returns true when dialog result is NO', async () => {
    confirmDialog.open.mockReturnValue(createDialogRef('NO'));

    await expect(getResult()).resolves.toBe(true);
  });

  it('saves and returns true when dialog result is YES and save succeeds', async () => {
    confirmDialog.open.mockReturnValue(createDialogRef('YES'));
    workspaceService.saveUnitData.mockResolvedValue(true);

    await expect(getResult()).resolves.toBe(true);
    expect(workspaceService.saveUnitData).toHaveBeenCalledTimes(1);
    expect(snackBar.open).toHaveBeenCalledWith(
      'workspace.unit-saved',
      '',
      { duration: 1000 }
    );
  });

  it('saves and returns false when dialog result is YES and save fails', async () => {
    confirmDialog.open.mockReturnValue(createDialogRef('YES'));
    workspaceService.saveUnitData.mockResolvedValue(false);

    await expect(getResult()).resolves.toBe(false);
    expect(workspaceService.saveUnitData).toHaveBeenCalledTimes(1);
    expect(snackBar.open).toHaveBeenCalledWith(
      'workspace.unit-not-saved',
      '',
      { duration: 1000 }
    );
  });

  it('returns false for unexpected dialog results', async () => {
    confirmDialog.open.mockReturnValue(createDialogRef('MAYBE'));

    await expect(getResult()).resolves.toBe(false);
  });

  it('passes warning state when form key is invalid', async () => {
    workspaceService.isValidFormKey.next(false);
    confirmDialog.open.mockReturnValue(createDialogRef('NO'));

    await getResult();

    expect(confirmDialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({
          warning: true
        })
      })
    );
  });
});
