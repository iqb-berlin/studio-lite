import {
  Component, Input, OnChanges, OnDestroy, OnInit, EventEmitter, Output, ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Observable, of, Subscription} from 'rxjs';
import { WorkspaceService } from '../../workspace.service';
import {BackendService, UnitMetadata} from '../../backend.service';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {switchMap} from "rxjs/operators";

@Component({
  templateUrl: './unit-metadata.component.html',
  styles: ['.mat-tab-body-wrapper {height: 100%;}',
    'mat-tab-body {height: 100%;}']
})

export class UnitMetadataComponent implements OnInit, OnDestroy, OnChanges {
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
    public ds: WorkspaceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.unitForm = this.fb.group({
      key: this.fb.control(''),
      label: this.fb.control(''),
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
        WorkspaceService.unitKeyUniquenessValidator(unitData.id, this.ds.unitList.units())]);
      this.unitForm.setValue({
        key: unitData.key,
        label: unitData.name,
        description: unitData.description
      }, { emitEvent: false });
      if (this.editorDiv) this.editorDiv.innerText = unitData.editor ? unitData.editor : '';
      if (this.playerDiv) this.playerDiv.innerText = unitData.player ? unitData.player : '';

      this.unitFormDataChangedSubscription = this.unitForm.valueChanges.subscribe(() => {
        console.log(this.unitForm.get('key')?.value);
      })
    });
  }

  ngOnChanges(): void {
    // if (this.unitForm) this.readData();
  }

  ngOnDestroy(): void {
    if (this.routingSubscription) this.routingSubscription.unsubscribe();
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
  }
}
