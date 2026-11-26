import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { SelectTargetWorkspaceComponent, SelectTargetWorkspaceData } from './select-target-workspace.component';

describe('SelectTargetWorkspaceComponent', () => {
  let fixture: ComponentFixture<SelectTargetWorkspaceComponent>;
  let close: jest.Mock;

  const create = (commentsOption: boolean) => {
    close = jest.fn();
    TestBed.configureTestingModule({
      imports: [SelectTargetWorkspaceComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: <SelectTargetWorkspaceData>{
            title: 'Aufgabe kopieren',
            confirmLabel: 'Kopieren',
            workspaces: [{
              id: 7, name: 'Dort', groupId: 1, groupName: 'Mathe'
            }],
            commentsOption,
            hints: []
          }
        },
        { provide: MatDialogRef, useValue: { close } }
      ]
    });
    fixture = TestBed.createComponent(SelectTargetWorkspaceComponent);
    fixture.detectChanges();
  };
  const confirmButton = () => (fixture.nativeElement as HTMLElement)
    .querySelector<HTMLButtonElement>('[data-cy="select-target-workspace-confirm"]');

  it('confirms only with a workspace chosen, and returns it with whether to copy the comments', () => {
    create(true);
    expect(confirmButton()?.disabled).toBe(true);

    fixture.componentInstance.targetWorkspaceId.set(7);
    fixture.componentInstance.copyComments.set(false);
    fixture.detectChanges();
    confirmButton()?.click();

    expect(close).toHaveBeenCalledWith({ targetWorkspaceId: 7, copyComments: false });
  });

  it('takes no comments along where there is no choice: moving', () => {
    create(false);

    fixture.componentInstance.targetWorkspaceId.set(7);

    expect(fixture.componentInstance.result()).toEqual({ targetWorkspaceId: 7, copyComments: false });
  });
});
