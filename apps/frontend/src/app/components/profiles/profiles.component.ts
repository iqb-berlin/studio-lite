import {
  Component, OnInit, Output, EventEmitter, Input, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { MDProfile } from '@iqbspecs/metadata-profile';
import { MDProfileStore } from '@iqbspecs/metadata-store/metadata-store.interface';
import { toW3idProfileId } from '@studio-lite/shared-code';
import { TranslateModule } from '@ngx-translate/core';
import { MatError } from '@angular/material/form-field';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  Subject, takeUntil, firstValueFrom, of, forkJoin, from, switchMap, map
} from 'rxjs';
import { ProfileStoreWithProfiles, WsgAdminService } from '../../modules/wsg-admin/services/wsg-admin.service';
import { Profile } from '../../models/profile.type';
import { MetadataBackendService } from '../../modules/metadata/services/metadata-backend.service';
import { ProfileLabelPipe } from '../../pipes/profile-label.pipe';
import { IsProfileSelectedPipe } from '../../pipes/is-profile-selected.pipe';

export type CoreProfile = Profile;

@Component({
  selector: 'studio-lite-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  imports: [MatProgressSpinner, FormsModule, MatExpansionPanel, MatExpansionPanelHeader,
    MatExpansionPanelTitle, MatCheckbox, MatError, TranslateModule, ProfileLabelPipe, IsProfileSelectedPipe]
})
export class ProfilesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  isLoading: boolean = false;
  isError: boolean = false;
  profileStoresWithProfiles : ProfileStoreWithProfiles[] = [];
  fetchedProfiles: CoreProfile[] = [];
  profilesSelected : CoreProfile[] = [];
  profile!:Profile;

  @Output() hasChanged = new EventEmitter<Array<CoreProfile>>();
  private _profiles: Profile[] | undefined;

  @Input()
  set profiles(value: Profile[]) {
    this._profiles = value;
    if (value) {
      this.fetchedProfiles = value;
      this.profilesSelected = [...this.fetchedProfiles];
      this.changeDetectorRef.detectChanges();
    }
  }

  get profiles(): Profile[] {
    return this._profiles || [];
  }

  constructor(
    private wsgAdminService: WsgAdminService,
    private backendService: MetadataBackendService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadProfiles();
  }

  private loadProfiles(): void {
    this.isLoading = true;
    this.backendService.getRegisteredProfiles()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap(registeredProfiles => {
          if (!Array.isArray(registeredProfiles)) {
            this.isError = true;
            return of([]);
          }
          this.isError = false;
          // The backend yields a null entry for every registry url it could not
          // fetch, and an empty registry (or one whose csv could not be parsed)
          // yields an empty list — forkJoin([]) would never emit and leave the
          // panel spinning forever. Both are guarded here.
          const fetchedProfiles = registeredProfiles.filter(Boolean);
          if (!fetchedProfiles.length) return of([]);
          const storeObsList = fetchedProfiles.map(registeredProfile => {
            const profileFiles = registeredProfile.profiles ?? [];
            // Newer registry entries are direct profiles (empty profiles list): the
            // registered url is the profile itself. Classic stores instead list the
            // relative profile files resolved against the store url.
            const profileUrls = profileFiles.length ?
              profileFiles.map(file => {
                const base = registeredProfile.url.slice(0, registeredProfile.url.lastIndexOf('/'));
                return `${base}/${file}`;
              }) :
              [registeredProfile.url];
            const profilePromises = profileUrls.map(profileUrl => this.getProfile(profileUrl));
            return from(Promise.all(profilePromises)).pipe(
              map(profiles => ({
                profileStore: registeredProfile as MDProfileStore,
                profiles: profiles.filter(p => !!p) as MDProfile[]
              }))
            );
          });
          return forkJoin(storeObsList);
        })
      )
      .subscribe({
        next: profileStoresWithProfiles => {
          this.profileStoresWithProfiles = profileStoresWithProfiles;
          this.wsgAdminService.profileStores = this.profileStoresWithProfiles;
          this.isLoading = false;

          if (this.profilesSelected.length === 0) {
            const currentSettings = this.wsgAdminService.selectedWorkspaceGroupSettings.getValue();
            this.fetchedProfiles = this._profiles !== undefined ?
              (this._profiles || []) : (currentSettings.profiles || []);
            this.profilesSelected = [...this.fetchedProfiles];
          }

          this.changeDetectorRef.detectChanges();
        },
        // Without this the panel would keep spinning with no message on any
        // unexpected stream error instead of showing the error state.
        error: () => {
          this.isLoading = false;
          this.isError = true;
          this.changeDetectorRef.detectChanges();
        }
      });

    this.wsgAdminService.selectedWorkspaceGroupSettings
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(settings => {
        if (settings && this._profiles === undefined) {
          this.fetchedProfiles = settings.profiles || [];
          this.profilesSelected = [...this.fetchedProfiles];
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  async getProfile(profileUrl:string): Promise<MDProfile | null> {
    try {
      const profile = await firstValueFrom(this.backendService.getMetadataProfile(profileUrl));
      if (profile && profile !== true) {
        return profile as unknown as MDProfile;
      }
    } catch {
      // return null if error occurs
    }
    return null;
  }

  // Ids are canonicalized on both sides (here and in the isProfileSelected pipe),
  // so adding and removing agree on what "the same profile" is even when the
  // stored selection still uses the retired github spelling (#1570). Selecting
  // also rewrites the stored id, so the group settings come back canonical.
  // The array is replaced rather than mutated: the pure pipe in the template only
  // re-evaluates when the reference changes.
  changeSelection(checkbox:MatCheckboxChange) {
    const id = toW3idProfileId(checkbox.source.id || '');
    this.profilesSelected = checkbox.checked ?
      [...this.profilesSelected, { id, label: checkbox.source.name || '' }] :
      this.profilesSelected
        .filter((profile: CoreProfile) => toW3idProfileId(profile.id) !== id);
    this.hasChanged.emit(this.profilesSelected);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
