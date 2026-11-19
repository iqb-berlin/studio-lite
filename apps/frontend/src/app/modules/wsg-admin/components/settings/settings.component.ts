import {
  Component, OnDestroy, OnInit, signal
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  State, WorkspaceGroupSettingsDto
} from '@studio-lite-lib/api-dto';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatCard, MatCardContent, MatCardHeader, MatCardTitle
} from '@angular/material/card';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { CoreProfile, ProfilesComponent } from '../../../../components/profiles/profiles.component';
import { StatesComponent } from '../states/states.component';
import {
  UnitRichNoteTagsConfigComponent
} from '../../../admin/components/unit-rich-note-tags-config/unit-rich-note-tags-config.component';
import { SaveLock } from '../../../../classes/save-lock.class';

@Component({
  selector: 'studio-lite-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [MatTooltip, ProfilesComponent, StatesComponent, TranslateModule, MatFabButton,
    MatIcon, MatCard, MatCardHeader, MatCardTitle, MatCardContent, UnitRichNoteTagsConfigComponent]
})
export class WorkspaceSettingsComponent implements OnInit, OnDestroy {
  settings!: WorkspaceGroupSettingsDto;
  // One save at a time, and what it sent: what is entered meanwhile stays a change (#2094).
  readonly save = new SaveLock();
  // Held by the page, not by the service: leaving the page discards what is not saved, so the page built anew
  // has nothing to save (#2163).
  private readonly settingsChangedState = signal(false);
  readonly settingsChanged = this.settingsChangedState.asReadonly();
  // What this page saved last, published when it is left (see ngOnDestroy).
  private saved?: WorkspaceGroupSettingsDto;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    public wsgAdminService:WsgAdminService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.wsgAdminService.selectedWorkspaceGroupSettings
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(settings => {
        this.settings = { ...settings };
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // The page, the states and the profiles are built from what is published. Published while the page is open,
    // the saved settings would reset what was entered while the save was under way (#2094); published when it is
    // left, they are what the page shows when it is opened again, not what was entered and never saved (#2163).
    if (this.saved) this.wsgAdminService.selectedWorkspaceGroupSettings.next(this.saved);
  }

  async saveGroupSettings() {
    // a copy: what is sent must not change with the edits made while it is under way
    const sent = structuredClone(this.settings);
    if (!this.save.start(sent)) return;
    this.wsgAdminService.setWorkspaceGroupSettings(
      this.wsgAdminService.selectedWorkspaceGroupId.value, sent)
      .pipe(
        takeUntil(this.ngUnsubscribe))
      .subscribe(
        respOk => {
          this.save.finish();
          if (respOk) {
            this.saved = sent;
            this.settingsChangedState.set(this.save.differsFromSent(this.settings));
            this.snackBar.open(
              this.translateService.instant('wsg-settings.changed'),
              '',
              { duration: 1000 });
          } else {
            this.settingsChangedState.set(true);
            this.snackBar.open(
              this.translateService.instant('wsg-settings.changed'),
              this.translateService.instant('error'),
              { duration: 3000 }
            );
          }
        }
      );
  }

  profileSettingsChange(profiles:CoreProfile[]) {
    this.settingsChangedState.set(true);
    this.settings.profiles = profiles;
  }

  stateSettingsChange(states:State[]) {
    this.settingsChangedState.set(true);
    // A deleted state is only in the states before the change, and units keep its id (#2009).
    this.settings.lastStateId = Math.max(
      this.settings.lastStateId ?? 0,
      ...(this.settings.states || []).map(state => state.id),
      ...states.map(state => state.id)
    );
    this.settings.states = states;
  }

  richNoteTagsSettingsChange(tags: string[]) {
    this.settingsChangedState.set(true);
    this.settings.richNoteTags = tags;
  }
}
