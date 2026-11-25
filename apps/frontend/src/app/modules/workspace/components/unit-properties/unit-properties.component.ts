import {
  Component, OnDestroy, signal, ViewChild
} from '@angular/core';
import {
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { State, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent
} from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ConfirmDialogComponent } from '@studio-lite-lib/iqb-components';
import { NewGroupButtonComponent } from '../new-group-button/new-group-button.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { SelectModuleComponent } from '../../../../components/select-module/select-module.component';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { ModuleService } from '../../../../services/module.service';
import { RequestMessageDirective } from '../../directives/request-message.directive';
import { CanReturnUnitPipe } from '../../pipes/can-return-unit.pipe';
import { I18nService } from '../../../../services/i18n.service';
import { UnitCheckComponent } from '../unit-check/unit-check.component';
import { UNIT_KEY_MAX_LENGTH, UNIT_KEY_MIN_LENGTH } from '../../utils/unit-key.utils';

/**
 * Everything about a unit that is not its content: name and key, the modules it is opened with, its
 * state and group, its transcript and reference, and beside them the technical validation. The
 * metadata have a tab of their own (#2200).
 *
 * The form writes into the unit's stores rather than to the server; saving is a separate act, and
 * leaving the unit with unsaved changes is what the guard asks about.
 */
@Component({
  templateUrl: './unit-properties.component.html',
  styleUrls: ['unit-properties.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatOption,
    NewGroupButtonComponent,
    CdkTextareaAutosize,
    SelectModuleComponent,
    MatButton,
    DatePipe,
    TranslateModule,
    MatIcon,
    CanReturnUnitPipe,
    MatProgressSpinner,
    UnitCheckComponent
  ]
})
export class UnitPropertiesComponent
  extends RequestMessageDirective
  implements OnDestroy {
  @ViewChild('editor') editorSelector: SelectModuleComponent | undefined;
  @ViewChild('player') playerSelector: SelectModuleComponent | undefined;
  @ViewChild('schemer') schemerSelector: SelectModuleComponent | undefined;
  private unitIdChangedSubscription: Subscription | undefined;
  private unitFormDataChangedSubscription: Subscription | undefined;
  private editorSelectionChangedSubscription: Subscription | undefined;
  private playerSelectionChangedSubscription: Subscription | undefined;
  private schemerSelectionChangedSubscription: Subscription | undefined;
  private statesChangedSubscription: Subscription | undefined;
  ngUnsubscribe = new Subject<void>();
  unitForm: UntypedFormGroup;
  form = new FormGroup({});
  selectedStateId: string | null = null;
  selectedStateColor = '';
  selectedUnitId = 0;
  initialTranscript = '';
  initialReference = '';
  private readonly propertiesNotLoadedState = signal(false);
  readonly propertiesNotLoaded = this.propertiesNotLoadedState.asReadonly();

  constructor(
    private fb: UntypedFormBuilder,
    public workspaceService: WorkspaceService,
    public unitStores: UnitStoresService,
    public moduleService: ModuleService,
    public backendService: WorkspaceBackendService,
    public router: Router,
    public route: ActivatedRoute,
    public snackBar: MatSnackBar,
    public selectUnitDialog: MatDialog,
    public uploadReportDialog: MatDialog,
    private confirmDialog: MatDialog,
    public translateService: TranslateService,
    public i18nService: I18nService
  ) {
    super();
    this.unitForm = this.fb.group({
      key: this.fb.control(''),
      name: this.fb.control(''),
      description: this.fb.control(''),
      state: this.fb.control(''),
      group: this.fb.control(''),
      transcript: this.fb.control(''),
      reference: this.fb.control('')
    });
    this.unitIdChangedSubscription =
      this.workspaceService.selectedUnit$.subscribe(id => {
        this.readDataForUnitId(id);
      });
  }

  private readDataForUnitId(unitId: number): void {
    this.selectedUnitId = unitId;
    this.propertiesNotLoadedState.set(false);
    this.readData();
  }

  // properties
  private async readData() {
    if (Object.keys(this.moduleService.editors).length === 0) await this.moduleService.loadList();
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    if (this.editorSelectionChangedSubscription) this.editorSelectionChangedSubscription.unsubscribe();
    if (this.playerSelectionChangedSubscription) this.playerSelectionChangedSubscription.unsubscribe();
    if (this.schemerSelectionChangedSubscription) this.schemerSelectionChangedSubscription.unsubscribe();
    if (this.statesChangedSubscription) this.statesChangedSubscription.unsubscribe();
    this.workspaceService
      .loadUnitProperties()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.setupForm());
  }

  private setupForm() {
    const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
    const unitPropertiesStore = this.unitStores.propertiesStore();
    // the store of a unit the server did not answer for holds its id alone, and filling the form
    // with it failed, so that the form went on showing the unit before (#2004)
    this.propertiesNotLoadedState.set(selectedUnitId > 0 && !!unitPropertiesStore && !unitPropertiesStore.loaded);
    if (selectedUnitId > 0 && unitPropertiesStore?.loaded) {
      const unitProperties = unitPropertiesStore.getData();
      this.selectedStateId = unitProperties.state || null;
      const keyControl = this.unitForm.get('key');
      if (keyControl) {
        keyControl.markAsUntouched();
        keyControl.setValidators([
          Validators.required,
          Validators.minLength(UNIT_KEY_MIN_LENGTH),
          Validators.maxLength(UNIT_KEY_MAX_LENGTH),
          Validators.pattern(WorkspaceService.unitKeyPatternString()),
          WorkspaceService.unitKeyUniquenessValidator(
            unitProperties.id,
            () => this.workspaceService.unitList
          )
        ]);
      }
      this.unitForm.setValue(
        {
          key: unitProperties.key,
          name: unitProperties.name,
          state: unitProperties.state,
          description: unitProperties.description,
          reference: unitProperties.reference,
          transcript: unitProperties.transcript,
          group: unitProperties.groupName
        },
        { emitEvent: false }
      );

      if (keyControl) {
        keyControl.updateValueAndValidity({ emitEvent: false });
        if (keyControl.invalid) {
          keyControl.markAsTouched();
        }

        this.workspaceService.isValidFormKey.next(
          keyControl.status === 'VALID'
        );
        this.reportUnitKeyRefused();
      }

      this.selectedStateColor = unitProperties.state || '';
      this.unitFormDataChangedSubscription = this.unitForm.valueChanges.subscribe(() => {
        const filteredState = this.workspaceService.states
          ?.filter((state:State) => state.id.toString() === this.unitForm.get('state')?.value) || 0;
        filteredState.length ? this.selectedStateColor = filteredState[0].color : this.selectedStateColor = '';
        const isValidFormKey = this.unitForm.get('key')?.status === 'VALID';
        this.workspaceService.isValidFormKey.next(isValidFormKey);
        this.unitStores.propertiesStore()?.setBasicData(
          this.unitForm.get('key')?.value,
          this.unitForm.get('name')?.value,
          this.unitForm.get('description')?.value,
          this.unitForm.get('group')?.value,
          this.unitForm.get('transcript')?.value,
          this.unitForm.get('reference')?.value,
          this.unitForm.get('state')?.value
        );
        this.reportUnitKeyRefused();
      });
      this.unitForm.enable();
      // timeout because we access ViewChildren
      setTimeout(() => this.initVeronaModules(unitProperties));
      setTimeout(() => {
        const filteredStates = this.workspaceService.states?.filter(
          (state: State) => state.id.toString() === unitProperties.state
        );
        filteredStates?.length ?
          (this.selectedStateColor = filteredStates[0].color) :
          (this.selectedStateColor = '');
      }, 1);
    } else {
      // bound to the state select beside the form, it would put back the state of the unit before
      this.selectedStateId = null;
      this.selectedStateColor = '';
      this.unitForm.setValue(
        {
          key: '',
          name: '',
          description: '',
          group: '',
          reference: '',
          transcript: '',
          state: ''
        },
        { emitEvent: false }
      );
      this.unitForm.disable();
    }
    this.initialTranscript = this.unitForm.get('transcript')?.value;
    this.initialReference = this.unitForm.get('reference')?.value;
  }

  /**
   * A key the server refuses blocks saving only once it is a change: a unit that already carries a
   * key another unit has -- from before the server checked renames -- stays editable, as the server
   * only checks a key that is changed (#1842). Too long is refused as well, since the database column
   * holds no more than 20 characters and saving such a key failed (#2120); no stored key is longer.
   * So is an empty key, blanks only included, which a unit cannot be created with either (#2095), now
   * that the dialog on leaving the unit no longer blocks saving every key that breaks a rule (#2127).
   */
  private reportUnitKeyRefused(): void {
    const keyChanged = this.unitStores.propertiesStore()?.getChangedData().key !== undefined;
    const keyControl = this.unitForm.get('key');
    const blank = !`${keyControl?.value ?? ''}`.trim();
    const refused = blank || !!keyControl?.hasError('keyNotUnique') || !!keyControl?.hasError('maxlength');
    this.workspaceService.setUnitKeyRefused(keyChanged && refused);
  }

  private initVeronaModules(unitProperties: UnitPropertiesDto): void {
    if (this.editorSelector) {
      this.editorSelector.value = unitProperties.editor || '';
      this.editorSelectionChangedSubscription =
        this.editorSelector.selectionChanged.subscribe(selectedValue => {
          this.unitStores
            .propertiesStore()
            ?.setEditor(selectedValue);
        });
    }
    if (this.playerSelector) {
      this.playerSelector.value = unitProperties.player || '';
      this.playerSelectionChangedSubscription =
        this.playerSelector.selectionChanged.subscribe(selectedValue => {
          this.unitStores
            .propertiesStore()
            ?.setPlayer(selectedValue);
        });
    }
    if (this.schemerSelector) {
      this.schemerSelector.value = unitProperties.schemer || '';
      this.schemerSelectionChangedSubscription =
        this.schemerSelector.selectionChanged.subscribe(selectedValue => {
          this.unitStores
            .propertiesStore()
            ?.setSchemer(selectedValue);
        });
    }
  }

  onGroupNameChange(name: string): void {
    this.unitForm.get('group')?.setValue(name);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.unitIdChangedSubscription) this.unitIdChangedSubscription.unsubscribe();
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    if (this.editorSelectionChangedSubscription) this.editorSelectionChangedSubscription.unsubscribe();
    if (this.playerSelectionChangedSubscription) this.playerSelectionChangedSubscription.unsubscribe();
    if (this.schemerSelectionChangedSubscription) this.schemerSelectionChangedSubscription.unsubscribe();
    if (this.statesChangedSubscription) this.statesChangedSubscription.unsubscribe();
  }

  deleteDeprecatedProperty(property: 'transcript' | 'reference'): void {
    const propertyControl = this.unitForm.get(property);
    if (propertyControl) {
      propertyControl.setValue('');
    }
  }

  async submitUnit(): Promise<void> {
    this.confirmDialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: this.translateService.instant('workspace.submit-unit'),
          content: this.translateService.instant(
            'workspace.submit-unit-confirm'
          ),
          confirmButtonLabel: this.translateService.instant(
            'workspace.submit-units'
          ),
          showCancel: true
        }
      })
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(async confirmed => {
        if (!confirmed) return;
        const routingOk = await this.selectUnit(0);
        if (routingOk) {
          this.backendService
            .submitUnits(
              this.workspaceService.selectedWorkspaceId,
              this.workspaceService.dropBoxId!,
              [this.selectedUnitId]
            )
            .subscribe(uploadStatus => {
              this.showRequestMessage(
                uploadStatus,
                'workspace.unit-not-submitted',
                'workspace.unit-submitted'
              );
            });
        }
      });
  }

  async returnSubmittedUnit(): Promise<void> {
    this.confirmDialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: this.translateService.instant(
            'workspace.return-submitted-unit'
          ),
          content: this.translateService.instant(
            'workspace.return-submitted-unit-confirm'
          ),
          confirmButtonLabel: this.translateService.instant(
            'workspace.return-submitted-unit'
          ),
          showCancel: true
        }
      })
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(async confirmed => {
        if (!confirmed) return;
        const routingOk = await this.selectUnit(0);
        if (routingOk) {
          this.backendService
            .returnSubmittedUnits(this.workspaceService.selectedWorkspaceId, [
              this.selectedUnitId
            ])
            .subscribe(uploadStatus => {
              this.showRequestMessage(
                uploadStatus,
                'workspace.unit-not-returned',
                'workspace.unit-returned'
              );
            });
        }
      });
  }
}
