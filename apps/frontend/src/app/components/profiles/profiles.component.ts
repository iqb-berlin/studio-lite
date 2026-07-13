import {
  Component, OnInit, Output, EventEmitter, Input, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { MDProfile } from '@iqbspecs/metadata-profile';
import { MDProfileStore } from '@iqbspecs/metadata-store/metadata-store.interface';
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

export type CoreProfile = Profile;

@Component({
  selector: 'studio-lite-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  imports: [MatProgressSpinner, FormsModule, MatExpansionPanel,
    MatExpansionPanelHeader, MatExpansionPanelTitle, MatCheckbox, MatError, TranslateModule, ProfileLabelPipe]
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
          const storeObsList = registeredProfiles.map(registeredProfile => {
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
      .subscribe(profileStoresWithProfiles => {
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

  isChecked(id:string):boolean {
    return !!this.profilesSelected?.find((profile: { id: string; }) => profile.id === id);
  }

  changeSelection(checkbox:MatCheckboxChange) {
    checkbox.checked ?
      this.profilesSelected.push(
        { id: checkbox.source.id || '', label: checkbox.source.name || '' }) :
      this.profilesSelected = this.profilesSelected
        .filter((profile: CoreProfile) => profile.id !== checkbox.source.id);
    this.hasChanged.emit(this.profilesSelected);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
