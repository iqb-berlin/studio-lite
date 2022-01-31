import {Component, OnDestroy, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from '../workspace.service';
import { BackendService } from '../backend.service';

@Component({
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.css']
})
export class UnitComponent implements OnInit, OnDestroy {
  private routingSubscription: Subscription | undefined;

  constructor(
    public ds: WorkspaceService,
    private bs: BackendService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  static getMessageElement(msg: string): HTMLDivElement {
    const messageP = <HTMLParagraphElement>document.createElement('p');
    messageP.innerText = msg;
    const messageDiv = <HTMLDivElement>document.createElement('div');
    messageDiv.setAttribute('style', 'padding: 20px;');
    messageDiv.appendChild(messageP);
    return messageDiv;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.routingSubscription = this.route.params.subscribe(params => {
        const newUnitId = Number(params['u']);
        this.ds.unitDefinitionOld = '';
        this.ds.unitDefinitionNew = '';
        this.ds.unitDefinitionChanged = false;
        this.bs.getUnitMetadata(this.ds.selectedWorkspace, newUnitId).subscribe(
          umd => {
            // expression 'this.ds.unitMetadataNew = umd;' would not trigger changes in form
            this.ds.unitMetadataNew = {
              id: umd.id,
              key: umd.key,
              label: umd.label,
              description: umd.description,
              editorid: umd.editorid,
              playerid: umd.playerid,
              lastchanged: umd.lastchanged
            };
            this.ds.unitMetadataOld = {
              id: umd.id,
              key: umd.key,
              label: umd.label,
              description: umd.description,
              editorid: umd.editorid,
              playerid: umd.playerid,
              lastchanged: umd.lastchanged
            };
            this.ds.unitMetadataChanged = false;
            this.ds.selectedUnit$.next(umd.id); // triggers value changes in sub-elements
          },
          () => {
            this.ds.unitMetadataNew = null;
            this.ds.unitMetadataOld = null;
            this.ds.selectedUnit$.next(0);
          }
        );
      });
    });
  }

  ngOnDestroy(): void {
    if (this.routingSubscription) this.routingSubscription.unsubscribe();
  }
}
