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

@Component({
  selector: 'studio-lite-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [MatTooltip, ProfilesComponent, StatesComponent, TranslateModule, MatFabButton,
    MatIcon, MatCard, MatCardHeader, MatCardTitle, MatCardContent, UnitRichNoteTagsConfigComponent]
})
export class WorkspaceSettingsComponent implements OnInit, OnDestroy {
  settings!: WorkspaceGroupSettingsDto;
  private readonly savingState = signal(false);
  // While a save is under way the button is locked, and what is entered meanwhile stays a change (#2094).
  readonly saving = this.savingState.asReadonly();
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
  }

  async saveGroupSettings() {
    // also asked for by deleting a state (#2009): a deletion while a save is under way stays a change
    if (this.saving()) return;
    // a copy: what is sent must not change with the edits made while it is under way
    const sent = structuredClone(this.settings);
    this.savingState.set(true);
    this.wsgAdminService.setWorkspaceGroupSettings(
      this.wsgAdminService.selectedWorkspaceGroupId.value, sent)
      .pipe(
        takeUntil(this.ngUnsubscribe))
      .subscribe(
        respOk => {
          this.savingState.set(false);
          if (respOk) {
            this.wsgAdminService.settingsChanged = JSON.stringify(this.settings) !== JSON.stringify(sent);
            // What the page shows, not only what was sent: the form, the states and the profiles are built anew
            // from what is published here, and also when the page is opened again, so the stored settings alone
            // would drop what was entered while the save was under way. No reader takes it for what is stored.
            this.wsgAdminService.selectedWorkspaceGroupSettings.next(this.settings);
            this.snackBar.open(
              this.translateService.instant('wsg-settings.changed'),
              '',
              { duration: 1000 });
          } else {
            this.wsgAdminService.settingsChanged = true;
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
    this.wsgAdminService.settingsChanged = true;
    this.settings.profiles = profiles;
  }

  stateSettingsChange(states:State[]) {
    this.wsgAdminService.settingsChanged = true;
    // A deleted state is only in the states before the change, and units keep its id (#2009).
    this.settings.lastStateId = Math.max(
      this.settings.lastStateId ?? 0,
      ...(this.settings.states || []).map(state => state.id),
      ...states.map(state => state.id)
    );
    this.settings.states = states;
  }

  richNoteTagsSettingsChange(tags: string[]) {
    this.wsgAdminService.settingsChanged = true;
    this.settings.richNoteTags = tags;
  }
}
