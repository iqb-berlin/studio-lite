import {
  Component, computed, input, OnDestroy, OnInit, output, signal
} from '@angular/core';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import {
  MatCard, MatCardContent, MatCardHeader, MatCardTitle
} from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import {
  compareText, ResourcePackageChoice, resolveResourcePackage, withChosenResourcePackage
} from '@studio-lite/shared-code';
import { BackendService } from '../../../../services/backend.service';

/** One package name several packages stand in for, as the group may choose among them. */
interface PackageNameEntry {
  packageName: string;
  /** The installed names of its packages. */
  names: string[];
  /** The package the group chose; empty while it follows the default. */
  chosen: string;
  /** The package the default gives now, or null when nothing serves the name without a choice. */
  defaultName: string | null;
}

/**
 * Which package a workspace group gets for a package name several packages stand in for (#1358):
 * the administrator's default, which changes with it, or one chosen for good. Shown only when such
 * a package name exists; the choice is saved with the other group settings.
 */
@Component({
  selector: 'studio-lite-resource-package-choice',
  templateUrl: './resource-package-choice.component.html',
  styleUrls: ['./resource-package-choice.component.scss'],
  imports: [
    MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatFormField, MatLabel, MatSelect, MatOption,
    TranslateModule
  ]
})
export class ResourcePackageChoiceComponent implements OnInit, OnDestroy {
  readonly choice = input<ResourcePackageChoice | undefined>();
  readonly choiceChange = output<ResourcePackageChoice>();

  private readonly packages = signal<ResourcePackageDto[]>([]);
  private readonly defaults = signal<ResourcePackageChoice>({});
  private ngUnsubscribe = new Subject<void>();

  readonly entries = computed<PackageNameEntry[]>(() => {
    const packages = this.packages();
    const byPackageName = new Map<string, ResourcePackageDto[]>();
    packages.forEach(resourcePackage => {
      const key = resourcePackage.packageName.toLowerCase();
      byPackageName.set(key, [...(byPackageName.get(key) ?? []), resourcePackage]);
    });
    return [...byPackageName.values()]
      .filter(standingIn => standingIn.length > 1)
      .map(standingIn => {
        const { packageName } = standingIn[0];
        const chosen = resolveResourcePackage(packageName, packages, this.choice());
        return {
          packageName,
          names: standingIn.map(resourcePackage => resourcePackage.name).sort(compareText),
          chosen: chosen?.source === 'group' ? chosen.name : '',
          defaultName: resolveResourcePackage(packageName, packages, undefined, this.defaults())?.name ?? null
        };
      })
      .sort((a, b) => compareText(a.packageName, b.packageName));
  });

  constructor(private backendService: BackendService) {}

  ngOnInit(): void {
    forkJoin([this.backendService.getResourcePackages(), this.backendService.getResourcePackageDefaults()])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(([packages, defaults]) => {
        this.packages.set(packages);
        this.defaults.set(defaults);
      });
  }

  /** The choice with the package for one package name, or without it when the default is chosen. */
  select(packageName: string, name: string): void {
    this.choiceChange.emit(withChosenResourcePackage(this.choice(), packageName, name || undefined));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
