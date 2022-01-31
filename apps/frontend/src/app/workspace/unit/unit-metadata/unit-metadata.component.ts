import {
  Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Subscription} from 'rxjs';
import { WorkspaceService } from '../../workspace.service';
import {BackendService} from '../../backend.service';
import {ActivatedRoute, Router} from "@angular/router";
import {UnitMetadataDto} from "@studio-lite-lib/api-dto";

@Component({
  templateUrl: './unit-metadata.component.html',
  styles: ['.mat-tab-body-wrapper {height: 100%;}',
    'mat-tab-body {height: 100%;}']
})

export class UnitMetadataComponent implements OnInit, OnDestroy {
  @ViewChild('#editor') editorDiv: HTMLDivElement | undefined;
  @ViewChild('#player') playerDiv: HTMLDivElement | undefined;
  private routingSubscription: Subscription | undefined;
  private unitFormDataChangedSubscription: Subscription | undefined;
  workspaceId = 0;
  unitId = 0;
  unitForm: FormGroup;
  timeZone = 'Europe/Berlin';

  constructor(
    private fb: FormBuilder,
    private bs: BackendService,
    public workspaceService: WorkspaceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.unitForm = this.fb.group({
      key: this.fb.control(''),
      name: this.fb.control(''),
      description: this.fb.control('')
    });
  }

  ngOnInit(): void {
    if (this.route.parent) {
      this.routingSubscription = this.route.parent.params.subscribe(params => {
        this.workspaceId = Number(params['ws']);
        this.unitId = Number(params['u']);
        this.readData();
      })
    }
  }

  click() {
    console.log(this.route.parent ? this.route.parent.params : '#')
  }

  private readData(): void {
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    this.bs.getUnitMetadata(this.workspaceId, this.unitId).subscribe(unitData => {
      this.unitForm.controls['key'].setValidators([Validators.required, Validators.pattern('[a-zA-Z-0-9_]+'),
        Validators.minLength(3),
        WorkspaceService.unitKeyUniquenessValidator(unitData.id, this.workspaceService.unitList.units())]);
      this.unitForm.setValue({
        key: unitData.key,
        name: unitData.name,
        description: unitData.description
      }, { emitEvent: false });
      if (this.editorDiv) this.editorDiv.innerText = unitData.editor ? unitData.editor : '';
      if (this.playerDiv) this.playerDiv.innerText = unitData.player ? unitData.player : '';
      this.workspaceService.unitMetadata = unitData;
      this.workspaceService.setChangedUnitMetadata();
      this.unitFormDataChangedSubscription = this.unitForm.valueChanges.subscribe(() => {
        const newUnitData: UnitMetadataDto = {id: this.unitId};
        const newKey = this.unitForm.get('key')?.value;
        if (newKey !== this.workspaceService.unitMetadata.key) newUnitData.key = newKey;
        const newName = this.unitForm.get('name')?.value;
        if (newName !== this.workspaceService.unitMetadata.name) newUnitData.name = newName;
        const newDescription = this.unitForm.get('description')?.value;
        if (newDescription !== this.workspaceService.unitMetadata.description) newUnitData.description = newDescription;
        this.workspaceService.setChangedUnitMetadata(newUnitData);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.routingSubscription) this.routingSubscription.unsubscribe();
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
  }
}
