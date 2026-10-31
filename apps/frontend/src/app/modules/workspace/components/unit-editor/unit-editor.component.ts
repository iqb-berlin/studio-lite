import { Component, ElementRef, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';
import { RolePipe } from '../../pipes/role.pipe';
import { VeronaModuleDirective } from '../../../../directives/verona-module.directive';
import { TrackIframeActivityDirective } from '../../../../directives/track-iframe-activity.directive';
import { readSpecVersion } from '../../../../utils/spec-version.utils';

/**
 * Hosts the EDITOR a unit names and keeps the definition store in step with what it reports.
 *
 * The editor is talked to in the spec version it declares: what the current spec dropped is still
 * sent to an older editor, which would otherwise report no change at all -- see
 * {@link legacyDefinitionReportPolicy}.
 */
@Component({
  selector: 'studio-lite-unit-editor',
  templateUrl: './unit-editor.component.html',
  styleUrls: ['./unit-editor.component.scss'],
  host: { class: 'unit-editor' },
  imports: [MatProgressSpinner, TrackIframeActivityDirective]
})
export class UnitEditorComponent extends VeronaModuleDirective {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;
  editorApiVersion = 1;

  // Editor spec 4.0 dropped definitionReportPolicy together with voeGetDefinitionRequest: the editor
  // always reports the full definition from then on. EditorConfig is additionalProperties: false in
  // the current spec, so a strictly validating editor rejects a start command that still carries it.
  private static readonly DEFINITION_REPORT_POLICY_DROPPED_IN = 4;

  // Editors below that spec version may still read it, and the pre-4.0 default is 'on-demand' -- they
  // would wait for a voeGetDefinitionRequest that this app never sends, so no change would ever be
  // reported. Version detection below falls back to 2, keeping the property for anything unrecognized.
  private legacyDefinitionReportPolicy(): { definitionReportPolicy?: 'eager' } {
    return this.editorApiVersion < UnitEditorComponent.DEFINITION_REPORT_POLICY_DROPPED_IN ?
      { definitionReportPolicy: 'eager' } :
      {};
  }

  // Editor spec 5.0 writes the role in capitals: GUEST, COMMENTER, DEVELOPER, MAINTAINER, SUPER (#2065).
  private static readonly ROLE_IN_CAPITALS_FROM = 5;

  private role(): string {
    const role = new RolePipe().transform(this.workspaceService.userAccessLevel);
    return this.editorApiVersion >= UnitEditorComponent.ROLE_IN_CAPITALS_FROM ? role.toUpperCase() : role;
  }

  protected startSubscriptions(): void {
    this.subscribeForPostMessages();
    this.subscribeForSelectedUnitChange();
  }

  onSelectedUnitChange(): void {
    if (this.unitLoaded.getValue()) {
      this.unitLoaded.next(false);
      this.message = '';
      this.workspaceService
        .loadUnitProperties()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.onLoadUnitProperties();
        });
    } else {
      this.renewSubscriptions();
    }
  }

  handleIncomingMessage(m: MessageEvent) {
    if (!this.acceptMessageFromModule(m)) return;
    const msgData = m.data;
    const msgType = msgData.type;
    switch (msgType) {
      case 'voeReadyNotification':
      case 'vo.FromAuthoringModule.ReadyNotification':
        if (msgType === 'voeReadyNotification') {
          const specVersion = readSpecVersion(msgData);
          this.editorApiVersion = specVersion !== undefined && specVersion >= 3 ? specVersion : 2;
        } else {
          this.editorApiVersion = 1;
        }
        this.sessionId = UnitEditorComponent.getSessionId();
        this.sendUnitDefinition(this.workspaceService.selectedUnit$.getValue());
        break;

      case 'voeDefinitionChangedNotification':
      case 'vo.FromAuthoringModule.ChangedNotification':
        if (msgData.sessionId === this.sessionId) {
          if (this.editorApiVersion > 1) {
            if (msgData.unitDefinition) {
              this.unitStores
                .definitionStore()
                ?.setData(
                  msgData.variables,
                  msgData.unitDefinition,
                  typeof msgData.unitDefinitionType === 'string' ? msgData.unitDefinitionType : undefined
                );
              // } else { TODO: find solution for voeGetDefinitionRequest
              //   this.postMessageTarget.postMessage({
              //     type: 'voeGetDefinitionRequest',
              //     sessionId: this.sessionId
              //   }, '*');
            }
            if (msgData.sharedParameters) {
              this.sharedParameters = this.getMergedSharedParameters(msgData.sharedParameters);
            }
          } else {
            this.postMessageTarget?.postMessage(
              {
                type: 'vo.ToAuthoringModule.DataRequest',
                sessionId: this.sessionId
              },
              '*'
            );
          }
        }
        break;

      case 'vo.FromAuthoringModule.DataTransfer':
        if (msgData.sessionId === this.sessionId) {
          this.unitStores
            .definitionStore()
            ?.setData(msgData.variables, msgData.unitDefinition);
        }
        break;

      default:
        // eslint-disable-next-line no-console
        console.warn(`processMessagePost ignored message: ${msgType}`);
        break;
    }
  }

  private subscribeForVeronaModuleLoaded(): void {
    this.getVeronaModuleId(
      this.unitStores.metadataStore(),
      'editor'
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(editorId => this.showVeronaModule(
        editorId,
        'editor',
        () => this.sendUnitDefinition(this.workspaceService.selectedUnit$.getValue())
      ));
  }

  private onLoadUnitProperties() {
    this.subscribeForVeronaModuleLoaded();
  }

  postStore(unitDefinitionStore: UnitDefinitionStore): void {
    const unitDef = unitDefinitionStore.getData();
    if (this.postMessageTarget) {
      if (this.editorApiVersion === 1) {
        this.postMessageTarget.postMessage(
          {
            type: 'vo.ToAuthoringModule.DataTransfer',
            sessionId: this.sessionId,
            unitDefinition: unitDef.definition ? unitDef.definition : ''
          },
          '*'
        );
      } else {
        this.postMessageTarget.postMessage(
          {
            type: 'voeStartCommand',
            sessionId: this.sessionId,
            editorConfig: {
              ...this.legacyDefinitionReportPolicy(),
              directDownloadUrl: this.backendService.getDirectDownloadLink(),
              role: this.role(),
              sharedParameters: this.sharedParameters
            },
            unitDefinition: unitDef.definition ? unitDef.definition : '',
            ...(unitDef.definitionType && { unitDefinitionType: unitDef.definitionType })
          },
          '*'
        );
      }
      this.unitLoaded.next(true);
    }
  }
}
