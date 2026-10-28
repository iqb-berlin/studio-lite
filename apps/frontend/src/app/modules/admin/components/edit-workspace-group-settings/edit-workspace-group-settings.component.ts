import {
  Component, Inject, OnDestroy, OnInit, ChangeDetectorRef, signal
} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle
} from '@angular/material/dialog';
import { WorkspaceGroupFullDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { EditWorkspaceGroupComponentData } from '../../models/edit-workspace-group-component-data.type';
import { BackendService } from '../../services/backend.service';
import { ProfilesComponent } from '../../../../components/profiles/profiles.component';
import { Profile } from '../../../../models/profile.type';

@Component({
  selector: 'studio-lite-edit-workspace-group',
  templateUrl: './edit-workspace-group-settings.component.html',
  styleUrls: ['./edit-workspace-group-settings.component.scss'],
  imports: [ProfilesComponent, MatDialogActions, MatButton, MatDialogClose,
    TranslateModule, MatDialogContent, MatDialogTitle]
})

export class EditWorkspaceGroupSettingsComponent implements OnInit, OnDestroy {
  formData: {
    profilesSelected: Profile[]
  } = {
    profilesSelected: []
  };

  fetchedProfiles: Profile[] = [];
  // Saving replaces the group's profiles with the ones chosen here. Before the stored ones are in,
  // or after they failed to load, that would be the empty list the dialog starts with (#1960).
  private readonly profilesLoadState = signal<'pending' | 'loaded' | 'failed'>('pending');
  readonly profilesLoad = this.profilesLoadState.asReadonly();
  private ngUnsubscribe = new Subject<void>();

  constructor(public backendService: BackendService,
              private changeDetectorRef: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) public data: EditWorkspaceGroupComponentData) {
  }

  hasChanged(profiles: Profile[]): void {
    this.formData.profilesSelected = profiles;
  }

  async ngOnInit(): Promise<void> {
    this.backendService.getWorkspaceGroupById(this.data.wsg?.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.profilesLoadState.set(res ? 'loaded' : 'failed');
        this.fetchedProfiles = (
          res && (res as WorkspaceGroupFullDto).settings && (res as WorkspaceGroupFullDto).settings?.profiles
        ) || [];
        this.formData.profilesSelected = this.fetchedProfiles;
        this.changeDetectorRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
