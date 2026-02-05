/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EditUnitButtonComponent } from './edit-unit-button.component';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service'; // Corrected import
import { MetadataService } from '../../../metadata/services/metadata.service'; // Corrected import

class MockWorkspaceService {
  selectedWorkspaceName = 'Test Workspace';

  selectedWorkspaceId = 1;

  workspaceSettings = {
    unitMDProfile: 'profile',
    itemMDProfile: 'profile'
  };

  selectedUnit$ = new BehaviorSubject<number>(0);

  unitList = {};
}

class MockWorkspaceBackendService {
  // eslint-disable-next-line class-methods-use-this
  getUsersList() {
    return of([]);
  }
}

class MockAppService {
  dataLoading = false;
}

class MockAppBackendService {
  // eslint-disable-next-line class-methods-use-this
  setWorkspaceSettings() {
    return of(true);
  }
}

class MockMetadataService {
}

describe('EditUnitButtonComponent', () => {
  let component: EditUnitButtonComponent;
  let fixture: ComponentFixture<EditUnitButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTooltipModule,
        MatSnackBarModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: WorkspaceService, useClass: MockWorkspaceService },
        { provide: WorkspaceBackendService, useClass: MockWorkspaceBackendService },
        { provide: AppService, useClass: MockAppService },
        { provide: AppBackendService, useClass: MockAppBackendService },
        { provide: MetadataService, useClass: MockMetadataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditUnitButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set userListTitle on init', () => {
    expect(component.userListTitle).toBe('workspace.user-list');
  });
});
