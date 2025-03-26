import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { WorkspaceGroupsMenuComponent } from './workspace-groups-menu.component';
import { environment } from '../../../../../environments/environment';

describe('WorkspaceGroupsMenuComponent', () => {
  let component: WorkspaceGroupsMenuComponent;
  let fixture: ComponentFixture<WorkspaceGroupsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ],
      imports: [
        MatDialogModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspaceGroupsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
