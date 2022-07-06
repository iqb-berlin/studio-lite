import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { UntypedFormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  MessageDialogComponent,
  MessageDialogData,
  MessageType
} from '@studio-lite-lib/iqb-components';
import {
  CreateUserDto, UserFullDto, UserInListDto, WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import {
  BackendService
} from '../backend.service';
import { AppService } from '../../app.service';
import { EditUserComponent } from './edituser.component';
import { WorkspaceGroupToCheckCollection } from '../workspaces/workspaceChecked';

@Component({
  templateUrl: './users.component.html',
  styles: [
    '.scroll-area {height: calc(100% - 35px); overflow-y: auto;}',
    '.object-list {height: calc(100% - 5px);}'
  ]
})
export class UsersComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<UserFullDto>();
  displayedColumns = ['selectCheckbox', 'name', 'displayName', 'email', 'description'];
  tableSelectionCheckbox = new SelectionModel <UserFullDto>(true, []);
  tableSelectionRow = new SelectionModel <UserFullDto>(false, []);
  selectedUser = 0;

  userWorkspaces = new WorkspaceGroupToCheckCollection([]);

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private newUserDialog: MatDialog,
    private newPasswordDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private editUserDialog: MatDialog,
    private confirmDialog: MatDialog,
    private superadminPasswordDialog: MatDialog,
    private messsageDialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.tableSelectionRow.changed.subscribe(
      r => {
        if (r.added.length > 0) {
          this.selectedUser = r.added[0].id;
        } else {
          this.selectedUser = 0;
        }
        this.updateWorkspaceList();
      }
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.createWorkspaceList();
      this.appService.appConfig.setPageTitle('Admin: Nutzer:innen');
    });
  }

  // ***********************************************************************************
  addObject(): void {
    const dialogRef = this.editUserDialog.open(EditUserComponent, {
      width: '600px',
      data: {
        newUser: true,
        isAdmin: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          this.appService.dataLoading = true;
          const userData: CreateUserDto = {
            name: (<UntypedFormGroup>result).get('name')?.value,
            password: (<UntypedFormGroup>result).get('password')?.value,
            isAdmin: (<UntypedFormGroup>result).get('isAdmin')?.value,
            description: (<UntypedFormGroup>result).get('description')?.value,
            firstName: (<UntypedFormGroup>result).get('firstName')?.value,
            lastName: (<UntypedFormGroup>result).get('lastName')?.value,
            email: (<UntypedFormGroup>result).get('email')?.value
          };
          this.backendService.addUser(userData).subscribe(
            respOk => {
              this.updateUserList();
              if (respOk) {
                this.snackBar.open('Nutzer:in angelegt', '', { duration: 1000 });
              } else {
                this.snackBar.open('Konnte Nutzer:in nicht anlegen', 'Fehler', { duration: 3000 });
              }
            }
          );
        }
      }
    });
  }

  changeData(): void {
    let selectedRows = this.tableSelectionRow.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableSelectionCheckbox.selected;
    }
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Nutzerdaten ändern',
          content: 'Bitte markieren Sie erst eine/n Nutzer:in!',
          type: MessageType.error
        }
      });
    } else {
      const dialogRef = this.editUserDialog.open(EditUserComponent, {
        width: '600px',
        data: {
          newUser: false,
          name: selectedRows[0].name,
          description: selectedRows[0].description,
          isAdmin: selectedRows[0].isAdmin,
          firstName: selectedRows[0].firstName,
          lastName: selectedRows[0].lastName,
          email: selectedRows[0].email
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.appService.dataLoading = true;
            const newPassword: string = (<UntypedFormGroup>result).get('password')?.value;
            const newName: string = (<UntypedFormGroup>result).get('name')?.value;
            const newFirstName: string = (<UntypedFormGroup>result).get('firstName')?.value;
            const newLastName: string = (<UntypedFormGroup>result).get('lastName')?.value;
            const newEmail: string = (<UntypedFormGroup>result).get('email')?.value;
            const newDescription: string = (<UntypedFormGroup>result).get('description')?.value;
            const newIsAdmin: boolean = (<UntypedFormGroup>result).get('isAdmin')?.value;
            const changedData: UserFullDto = { id: selectedRows[0].id };
            if (newName !== selectedRows[0].name) changedData.name = newName;
            if (newDescription !== selectedRows[0].description) changedData.description = newDescription;
            if (newFirstName !== selectedRows[0].firstName) changedData.firstName = newFirstName;
            if (newLastName !== selectedRows[0].lastName) changedData.lastName = newLastName;
            if (newEmail !== selectedRows[0].email) changedData.email = newEmail;
            if (newPassword) changedData.password = newPassword;
            if (newIsAdmin !== selectedRows[0].isAdmin) changedData.isAdmin = newIsAdmin;
            this.backendService.changeUserData(changedData).subscribe(
              respOk => {
                this.updateUserList();
                if (respOk) {
                  this.snackBar.open('Nutzerdaten geändert', '', { duration: 1000 });
                } else {
                  this.snackBar.open('Konnte Nutzerdaten nicht ändern', 'Fehler', { duration: 3000 });
                }
              }
            );
          }
        }
      });
    }
  }

  deleteObject(): void {
    let selectedRows = this.tableSelectionCheckbox.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableSelectionRow.selected;
    }
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Löschen von Nutzer:innen',
          content: 'Bitte markieren Sie erst Nutzer:innen!',
          type: MessageType.error
        }
      });
    } else {
      let prompt = 'Soll';
      if (selectedRows.length > 1) {
        prompt = `${prompt}en ${selectedRows.length} Nutzer:innen `;
      } else {
        prompt = `${prompt} Nutzer:in "${selectedRows[0].name}" `;
      }
      const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: 'Löschen von Nutzer:innen',
          content: `${prompt}gelöscht werden?`,
          confirmButtonLabel: 'Löschen',
          showCancel: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          // =========================================================
          this.appService.dataLoading = true;
          const usersToDelete: number[] = [];
          selectedRows.forEach((r: UserFullDto) => usersToDelete.push(r.id));
          this.backendService.deleteUsers(usersToDelete).subscribe(
            respOk => {
              if (respOk) {
                this.snackBar.open('Nutzer:in gelöscht', '', { duration: 1000 });
                this.updateUserList();
              } else {
                this.snackBar.open('Konnte Nutzer:in nicht löschen', 'Fehler', { duration: 3000 });
                this.appService.dataLoading = false;
              }
            }
          );
        }
      });
    }
  }

  // ***********************************************************************************
  updateWorkspaceList(): void {
    if (this.userWorkspaces.hasChanged) {
      this.snackBar.open('Zugriffsrechte nicht gespeichert.', 'Warnung', { duration: 3000 });
    }
    if (this.selectedUser > 0) {
      this.appService.dataLoading = true;
      this.backendService.getWorkspacesByUser(this.selectedUser).subscribe(
        (dataresponse: WorkspaceInListDto[]) => {
          this.userWorkspaces.setChecks(dataresponse);
          this.appService.dataLoading = false;
        }
      );
    } else {
      this.userWorkspaces.setChecks();
    }
  }

  saveWorkspaces(): void {
    if (this.selectedUser > 0) {
      if (this.userWorkspaces.hasChanged) {
        this.appService.dataLoading = true;
        this.backendService.setWorkspacesByUser(this.selectedUser, this.userWorkspaces.getChecks()).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open('Zugriffsrechte geändert', '', { duration: 1000 });
              this.userWorkspaces.setHasChangedFalse();
            } else {
              this.snackBar.open('Konnte Zugriffsrechte nicht ändern', 'Fehler', { duration: 3000 });
            }
            this.appService.dataLoading = false;
          },
          err => {
            this.snackBar.open(`Konnte Zugriffsrechte nicht ändern (${err.code})`, 'Fehler', { duration: 3000 });
            this.appService.dataLoading = false;
          }
        );
      }
    }
  }

  // ***********************************************************************************
  updateUserList(): void {
    this.selectedUser = 0;
    this.appService.dataLoading = true;
    this.backendService.getUsersFull().subscribe(
      (dataresponse: UserFullDto[]) => {
        if (dataresponse.length > 0) {
          this.objectsDatasource = new MatTableDataSource(dataresponse);
          this.objectsDatasource.sort = this.sort;
          this.tableSelectionCheckbox.clear();
          this.tableSelectionRow.clear();
          this.appService.dataLoading = false;
        } else {
          this.tableSelectionCheckbox.clear();
          this.tableSelectionRow.clear();
          this.appService.dataLoading = false;
        }
      }
    );
  }

  createWorkspaceList(): void {
    this.userWorkspaces = new WorkspaceGroupToCheckCollection([]);
    this.backendService.getWorkspacesGroupwise().subscribe(worksGroups => {
      this.userWorkspaces = new WorkspaceGroupToCheckCollection(worksGroups);
      this.updateUserList();
    });
  }

  isAllSelected(): boolean {
    const numSelected = this.tableSelectionCheckbox.selected.length;
    const numRows = this.objectsDatasource ? this.objectsDatasource.data.length : 0;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() || !this.objectsDatasource ?
      this.tableSelectionCheckbox.clear() :
      this.objectsDatasource.data.forEach(row => this.tableSelectionCheckbox.select(row));
  }

  selectRow(row: UserInListDto): void {
    this.tableSelectionRow.select(row);
  }
}
