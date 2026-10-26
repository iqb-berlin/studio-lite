import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ChangeResultService } from './change-result.service';

describe('ChangeResultService', () => {
  let service: ChangeResultService;
  let snackBar: { open: jest.Mock };

  beforeEach(() => {
    snackBar = { open: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: MatSnackBar, useValue: snackBar },
        { provide: TranslateService, useValue: { instant: (key: string) => `t:${key}` } }
      ]
    });
    service = TestBed.inject(ChangeResultService);
  });

  it('shows the success text without a label for a second', () => {
    service.show(true, 'admin.group-created', 'admin.group-not-created');

    expect(snackBar.open).toHaveBeenCalledTimes(1);
    expect(snackBar.open).toHaveBeenCalledWith('t:admin.group-created', '', { duration: 1000 });
  });

  it('shows the error text with the error label for three seconds', () => {
    service.show(false, 'admin.group-created', 'admin.group-not-created');

    expect(snackBar.open).toHaveBeenCalledTimes(1);
    expect(snackBar.open).toHaveBeenCalledWith('t:admin.group-not-created', 't:error', { duration: 3000 });
  });

  it('takes the label of the area for the error', () => {
    service.show(false, 'workspace.unit-added', 'workspace.unit-not-added', 'workspace.error');

    expect(snackBar.open).toHaveBeenCalledWith('t:workspace.unit-not-added', 't:workspace.error', { duration: 3000 });
  });
});
