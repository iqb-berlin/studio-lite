/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ExportUnitFileConfigComponent } from './export-unit-file-config.component';
import { WorkspaceService } from '../../services/workspace.service';
import { ModuleService } from '../../../shared/services/module.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';

class MockWorkspaceService {
  selectedWorkspaceId = 1;
}

class MockModuleService {
  players = {};
}

class MockWorkspaceBackendService {
  // eslint-disable-next-line class-methods-use-this
  getUnitListWithProperties() {
    return of([]);
  }
}

describe('ExportUnitFileConfigComponent', () => {
  let component: ExportUnitFileConfigComponent;
  let fixture: ComponentFixture<ExportUnitFileConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatSelectModule,
        MatInputModule,
        FormsModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: WorkspaceService, useClass: MockWorkspaceService },
        { provide: ModuleService, useClass: MockModuleService },
        { provide: WorkspaceBackendService, useClass: MockWorkspaceBackendService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportUnitFileConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
