import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { CheckForChangesDirective } from './check-for-changes.directive';

class TestCheckForChangesDirective extends CheckForChangesDirective {
  constructor(
    protected confirmDiscardChangesDialog: MatDialog,
    protected translateService: TranslateService
  ) {
    super();
  }
}

describe('CheckForChangesDirective', () => {
  const directiveClosingWith = (dialogResult: boolean | undefined) => {
    const dialog = createMock<MatDialog>();
    dialog.open.mockReturnValue(createMock<MatDialogRef<unknown>>({ afterClosed: () => of(dialogResult) }));
    return {
      dialog,
      directive: new TestCheckForChangesDirective(dialog, createMock<TranslateService>())
    };
  };

  it('continues without asking when nothing is changed', async () => {
    const { dialog, directive } = directiveClosingWith(undefined);

    await expect(directive.checkForChangesAndContinue(false)).resolves.toBe(true);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('continues when the changes are to be discarded', async () => {
    const { directive } = directiveClosingWith(true);

    await expect(directive.checkForChangesAndContinue(true)).resolves.toBe(true);
  });

  // #1991: Esc, a click beside the dialog or navigation close it with undefined, which is no answer
  it('keeps the changes when the dialog is closed without an answer', async () => {
    const { directive } = directiveClosingWith(undefined);

    await expect(directive.checkForChangesAndContinue(true)).resolves.toBe(false);
  });
});
