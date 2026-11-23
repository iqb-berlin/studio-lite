import {
  Component, computed, Inject, Signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl, ReactiveFormsModule, Validators
} from '@angular/forms';
import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import {
  MatError, MatFormField, MatHint, MatLabel
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import {
  ResourcePackageChoice,
  ResourcePackageGroup,
  resolveResourcePackageForGroups,
  resourcePackageInUse,
  resourcePackageNameOf,
  resourcePackagesFor,
  suggestPackageName
} from '@studio-lite/shared-code';

/**
 * What the dialog is opened with: for an upload the file name, for a change the package. Beside it
 * the installed packages, the defaults and the groups, to tell what the step will reach (#1358).
 */
export interface ResourcePackageDialogData {
  fileName?: string;
  resourcePackage?: ResourcePackageDto;
  packages: ResourcePackageDto[];
  defaults: ResourcePackageChoice;
  groups: ResourcePackageGroup[];
}

/** What the confirming button hands back. */
export interface ResourcePackageDialogResult {
  packageName: string;
  overwrite: boolean;
}

/**
 * Asks for the package name a resource package stands in for (#1358): on an upload with the name its
 * file name suggests, on a change with the one it has. It tells what the step reaches -- the groups
 * an overwritten package changes for, the default a first package of its name becomes -- and keeps
 * a package in use from getting another name, which the API would refuse.
 */
@Component({
  selector: 'studio-lite-resource-package-dialog',
  templateUrl: './resource-package-dialog.component.html',
  styleUrls: ['./resource-package-dialog.component.scss'],
  imports: [
    MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, MatFormField, MatLabel,
    MatHint, MatError, MatInput, ReactiveFormsModule, TranslateModule
  ]
})
export class ResourcePackageDialogComponent {
  readonly fileName: string;
  /** The package of the same name an upload replaces, matched exactly as the API matches it. */
  readonly replaced: ResourcePackageDto | undefined;
  /** The groups an overwritten package changes for, as one text. */
  readonly reachedGroups: string;
  /**
   * Whether the package whose package name is to change is in use, so that the name can only be
   * spelt otherwise: names are compared regardless of case.
   */
  readonly inUse: boolean;
  readonly titleKey: string;
  readonly confirmKey: string;
  readonly packageName: FormControl<string>;
  private readonly packageNameValue: Signal<string>;
  readonly trimmedPackageName = computed(() => this.packageNameValue().trim());

  /** Whether the name entered may be saved: a package in use keeps its package name, spelt as it likes. */
  readonly blocked = computed(() => this.inUse &&
    this.trimmedPackageName().toLowerCase() !== this.data.resourcePackage?.packageName.toLowerCase());

  /** Whether the package becomes the default of its package name, there being no package for it yet. */
  readonly becomesDefault = computed(() => {
    const packageName = this.trimmedPackageName();
    const subject = this.data.resourcePackage;
    if (this.replaced || !packageName || packageName.toLowerCase() === subject?.packageName.toLowerCase()) {
      return false;
    }
    const others = this.data.packages.filter(other => other.name !== subject?.name);
    return !resourcePackagesFor(packageName, others).length;
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ResourcePackageDialogData,
    private dialogRef: MatDialogRef<ResourcePackageDialogComponent, ResourcePackageDialogResult>
  ) {
    const uploadedName = data.fileName ? resourcePackageNameOf(data.fileName) : undefined;
    this.replaced = data.packages.find(installed => installed.name === uploadedName);
    this.fileName = data.fileName ?? `${data.resourcePackage?.name}.itcr.zip`;
    this.reachedGroups = this.replaced ? this.groupsReaching(this.replaced).join(', ') : '';
    this.inUse = !!data.resourcePackage &&
      !!resourcePackageInUse(data.resourcePackage, data.packages, data.groups, data.defaults);
    this.titleKey = data.resourcePackage ? 'resource-packages.edit-title' : 'resource-packages.upload-title';
    this.confirmKey = (data.resourcePackage && 'save') ||
      (this.replaced ? 'resource-packages.overwrite' : 'resource-packages.upload');
    this.packageName = new FormControl<string>(
      (data.resourcePackage ?? this.replaced)?.packageName ?? suggestPackageName(this.fileName),
      {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100), Validators.pattern(/^[^/]*[^/\s][^/]*$/)]
      }
    );
    this.packageNameValue = toSignal(this.packageName.valueChanges, { initialValue: this.packageName.value });
    // an overwritten package keeps its package name
    if (this.replaced) this.packageName.disable();
  }

  confirm(): void {
    this.dialogRef.close({ packageName: this.packageName.value.trim(), overwrite: !!this.replaced });
  }

  private groupsReaching(resourcePackage: ResourcePackageDto): string[] {
    return resolveResourcePackageForGroups(
      resourcePackage.packageName, this.data.packages, this.data.groups, this.data.defaults
    )
      .filter(({ resolved }) => resolved?.name === resourcePackage.name)
      .map(({ group }) => group.name);
  }
}
