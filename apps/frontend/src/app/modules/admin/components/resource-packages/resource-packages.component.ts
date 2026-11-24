import {
  Component, Inject, OnDestroy, OnInit, ViewChild, WritableSignal, inject, signal
} from '@angular/core';
import {
  BehaviorSubject, forkJoin, Subject, switchMap, takeUntil
} from 'rxjs';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import {
  ResourcePackageChoice,
  ResourcePackageGroup,
  resolveResourcePackageForGroups,
  resourcePackageInUse,
  withChosenResourcePackage
} from '@studio-lite/shared-code';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  IqbFilesUploadQueueComponent,
  MessageDialogComponent,
  MessageDialogData,
  MessageType
} from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';
import { TableDataSourcePipe } from '../../pipes/table-data-source.pipe';
import { ResourcePackagesTableComponent } from '../resource-packages-table/resource-packages-table.component';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';
import { DeleteDialogComponent } from '../../../../components/delete-dialog/delete-dialog.component';
import { ChangeResultService } from '../../../../services/change-result.service';
import {
  ResourcePackageDialogComponent, ResourcePackageDialogData, ResourcePackageDialogResult
} from '../resource-package-dialog/resource-package-dialog.component';
import { resourcePackageUseTexts } from '../../../../utils/resource-package-use.utils';

/**
 * The administration of the resource packages: upload, package names, defaults, deletion. Several
 * packages may stand in for one package name (#1358); an upload asks for the package name first and
 * says whom it reaches, and a new default is set only after the groups it reaches are shown.
 */
@Component({
  selector: 'studio-lite-resource-packages',
  templateUrl: './resource-packages.component.html',
  styleUrls: ['./resource-packages.component.scss'],

  imports: [
    MatButton, MatTooltip, WrappedIconComponent, IqbFilesUploadQueueComponent,
    ResourcePackagesTableComponent, TranslateModule, TableDataSourcePipe
  ]
})

export class ResourcePackagesComponent implements OnInit, OnDestroy {
  @ViewChild('fileUploadQueue') fileUploadQueue!: IqbFilesUploadQueueComponent;
  readonly packages = signal<ResourcePackageDto[]>([]);
  readonly defaults = signal<ResourcePackageChoice>({});
  /**
   * Where the next upload goes, with the package name the dialog gave it. The queue hands each
   * upload its URL when the upload is added, so each carries its own query.
   */
  readonly uploadUrl: WritableSignal<string>;
  selectedResourcePackages: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  private ngUnsubscribe = new Subject<void>();

  private changeResult = inject(ChangeResultService);

  constructor(
    @Inject('SERVER_URL') public serverUrl: string,
    private writeBackendService: WriteBackendService,
    private readBackendService: ReadBackendService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    this.uploadUrl = signal(`${serverUrl}resource-packages`);
  }

  ngOnInit(): void {
    this.updateFormFields();
  }

  updateFormFields(): void {
    forkJoin([this.readBackendService.getResourcePackages(), this.readBackendService.getResourcePackageDefaults()])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(([packages, defaults]) => {
        this.packages.set(packages);
        this.defaults.set(defaults);
      });
  }

  /** Asks for the package name of the chosen file, then hands it to the queue -- or nothing on cancel. */
  uploadSelected(input: HTMLInputElement): void {
    const file = input.files?.[0];
    // so that choosing the same file again is a change as well
    input.value = '';
    if (!file) return;
    this.openPackageDialog({ fileName: file.name }, result => {
      const query = new URLSearchParams({ packageName: result.packageName });
      if (result.overwrite) query.set('overwrite', 'true');
      this.uploadUrl.set(`${this.serverUrl}resource-packages?${query}`);
      this.fileUploadQueue.add(file);
    });
  }

  editPackageName(resourcePackage: ResourcePackageDto): void {
    this.openPackageDialog({ resourcePackage }, result => {
      this.writeBackendService.setResourcePackageName(resourcePackage.id, result.packageName)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(ok => {
          this.changeResult.show(
            ok, 'resource-packages.package-name-changed', 'resource-packages.package-name-not-changed', 'admin.error'
          );
          this.updateFormFields();
        });
    });
  }

  /** Makes a package the default of its package name, once the groups that switch with it are shown. */
  setDefault(resourcePackage: ResourcePackageDto): void {
    this.withGroups(groups => {
      const switching = resolveResourcePackageForGroups(
        resourcePackage.packageName, this.packages(), groups, this.defaults()
      )
        .filter(({ resolved }) => resolved?.source !== 'group')
        .map(({ group }) => group.name);
      const params = { name: resourcePackage.name, packageName: resourcePackage.packageName };
      this.dialog.open(ConfirmDialogComponent, {
        width: '480px',
        data: <ConfirmDialogData>{
          title: this.translateService.instant('resource-packages.set-default-title'),
          content: switching.length ?
            this.translateService.instant(
              'resource-packages.set-default-content', { ...params, groups: switching.join(', ') }
            ) :
            this.translateService.instant('resource-packages.set-default-content-no-groups', params),
          confirmButtonLabel: this.translateService.instant('resource-packages.set-default-confirm'),
          showCancel: true
        }
      })
        .afterClosed()
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap(confirmed => (confirmed === true ?
            this.writeBackendService.setResourcePackageDefaults(
              withChosenResourcePackage(this.defaults(), resourcePackage.packageName, resourcePackage.name)
            ) :
            []))
        )
        .subscribe(ok => {
          this.changeResult.show(
            ok, 'resource-packages.default-set', 'resource-packages.default-not-set', 'admin.error'
          );
          this.updateFormFields();
        });
    });
  }

  /**
   * Deletes the selected packages once confirmed. A package in use is refused by the API (#1358);
   * the page tells why before anything is asked, and deletes nothing of the selection then.
   */
  deleteSelected(): void {
    const selected = this.selectedResourcePackages.value;
    this.withGroups(groups => {
      const refusals = this.inUseTexts(selected, groups);
      if (refusals.length) {
        this.dialog.open(MessageDialogComponent, {
          width: '480px',
          data: <MessageDialogData>{
            type: MessageType.warning,
            title: this.translateService.instant('resource-packages.delete-in-use-title'),
            content: refusals.join(' '),
            closeButtonLabel: this.translateService.instant('close')
          }
        });
      } else {
        this.confirmDelete(selected);
      }
    });
  }

  /** Asks before deleting exactly the packages checked for use, whatever is ticked meanwhile. */
  private confirmDelete(selected: number[]): void {
    const count = selected.length;
    const titleKey = count === 1 ? 'admin.delete-one-package' : 'admin.delete-many-packages';
    const contentKey = count === 1 ?
      'admin.delete-one-package-confirmation' : 'admin.delete-many-packages-confirmation';

    this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      data: {
        title: this.translateService.instant(titleKey, { count }),
        content: this.translateService.instant(contentKey, { count })
      }
    })
      .afterClosed()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap(confirmed => (confirmed ?
          this.writeBackendService.deleteResourcePackages(selected) :
          []))
      )
      .subscribe(ok => {
        this.changeResult.show(ok, 'admin.package-deleted', 'admin.package-not-deleted', 'admin.error');
        this.updateFormFields();
      });
  }

  /** For each selected package in use, one text: that it cannot be deleted, why, and what frees it. */
  private inUseTexts(selected: number[], groups: ResourcePackageGroup[]): string[] {
    return this.packages()
      .filter(resourcePackage => selected.includes(resourcePackage.id))
      .flatMap(resourcePackage => {
        const use = resourcePackageInUse(resourcePackage, this.packages(), groups, this.defaults());
        return use ? [[
          this.translateService.instant('resource-packages.delete-in-use', { name: resourcePackage.name }),
          ...resourcePackageUseTexts(use, resourcePackage.packageName)
            .map(text => this.translateService.instant(text.key, text.params))
        ].join(' ')] : [];
      });
  }

  private openPackageDialog(
    data: Pick<ResourcePackageDialogData, 'fileName' | 'resourcePackage'>,
    confirmed: (result: ResourcePackageDialogResult) => void
  ): void {
    this.withGroups(groups => {
      this.dialog.open<ResourcePackageDialogComponent, ResourcePackageDialogData, ResourcePackageDialogResult>(
        ResourcePackageDialogComponent,
        {
          width: '520px',
          data: {
            ...data, packages: this.packages(), defaults: this.defaults(), groups
          }
        }
      )
        .afterClosed()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(result => {
          if (result) confirmed(result);
        });
    });
  }

  /**
   * The groups and their choices, read fresh: a group admin may have chosen since the page opened.
   * Without them nothing goes on -- a dialog would say that a step reaches no group. The failed
   * request is reported like any other.
   */
  private withGroups(then: (groups: ResourcePackageGroup[]) => void): void {
    this.writeBackendService.getResourcePackageGroups()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(groups => {
        if (groups) then(groups);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
