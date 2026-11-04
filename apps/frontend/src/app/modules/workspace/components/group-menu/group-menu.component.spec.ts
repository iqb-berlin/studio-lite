import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { GroupMenuComponent } from './group-menu.component';

describe('GroupMenuComponent', () => {
  let component: GroupMenuComponent;
  let fixture: ComponentFixture<GroupMenuComponent>;
  let dialog: { open: jest.Mock<{ afterClosed: () => Observable<string | boolean | undefined> }> };

  const closeWith = (result: string | boolean | undefined): void => {
    dialog.open.mockReturnValueOnce({ afterClosed: () => of(result) });
  };

  beforeEach(async () => {
    dialog = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialog, useValue: dialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should add a group with the name the dialog returns', () => {
    const added = jest.fn();
    component.groupAdded.subscribe(added);
    closeWith('Gruppe 1');

    component.addGroup();

    expect(added).toHaveBeenCalledWith('Gruppe 1');
  });

  it('should rename the group to the name the dialog returns', () => {
    const renamed = jest.fn();
    component.groupRenamed.subscribe(renamed);
    closeWith('Gruppe 2');

    component.renameGroup();

    expect(renamed).toHaveBeenCalledWith('Gruppe 2');
  });

  it('should delete the group after confirmation', () => {
    const deleted = jest.fn();
    component.groupDeleted.subscribe(deleted);
    closeWith(true);

    component.deleteGroup();

    expect(deleted).toHaveBeenCalled();
  });

  // Cancel closes a dialog with false; Esc, a click beside it and navigation with undefined (#1844)
  describe.each([false, undefined])('a dialog closed with %s', result => {
    it('should add no group', () => {
      const added = jest.fn();
      component.groupAdded.subscribe(added);
      closeWith(result);

      component.addGroup();

      expect(added).not.toHaveBeenCalled();
    });

    it('should keep the name of the group', () => {
      const renamed = jest.fn();
      component.groupRenamed.subscribe(renamed);
      closeWith(result);

      component.renameGroup();

      expect(renamed).not.toHaveBeenCalled();
    });

    it('should keep the group', () => {
      const deleted = jest.fn();
      component.groupDeleted.subscribe(deleted);
      closeWith(result);

      component.deleteGroup();

      expect(deleted).not.toHaveBeenCalled();
    });
  });
});
