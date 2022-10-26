import {
  Component, Input, OnInit
} from '@angular/core';
import { AppService } from '../../app.service';
import { BackendService } from '../backend.service';

export interface SelectUnitData {
  title: string,
  buttonLabel: string,
  fromOtherWorkspacesToo: boolean,
  multiple: boolean
}

@Component({
  selector: 'unit-info',
  template: `
    <div fxLayout="row" fxLayoutAlign="space-between stretch" style="height: 100%">
      <div id="unit-info-splitter"></div>
      <div id="unit-info-content" fxFlex>content</div>
    </div>
  `,
  styles: [
    `#unit-info-splitter {
      cursor: col-resize;
      background-color: lightgray;
      width: 6px;
      height: 100%;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }`,
    `#unit-info-content {
      background-color: teal;
    }`
  ]
})
export class UnitInfoComponent implements OnInit {
  splitter?: HTMLDivElement;
  infoPane?: HTMLDivElement;
  currentInfoPaneWidth = 0;
  mouseStartPositionX = 0;

  _unitId = 0;
  @Input('unitId')
  set unitId(value: number) {
    this._unitId = value;
  }

  constructor(
    private backendService: BackendService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.splitter = <HTMLDivElement>document.querySelector('#unit-info-splitter');
    if (this.splitter) this.splitter.onmousedown = this.onMouseDown;
    const divHeight1 = this.splitter ? this.splitter.clientWidth : -1;
    this.infoPane = <HTMLDivElement>document.querySelector('#unit-info-content');
    // this.infoPane.setAttribute('width', '201px');
    const divHeight2 = this.infoPane ? this.infoPane.clientWidth : -1;
  }

  onMouseDown(e: MouseEvent) {
    if (this.infoPane) {
      this.currentInfoPaneWidth = this.infoPane.clientWidth;
      this.mouseStartPositionX = e.clientX;
      console.log('delta');
    }
    document.onmousemove = this.onMouseMove;
    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }

  onMouseMove(e: MouseEvent) {
    console.log(this.infoPane);
    if (this.infoPane) {
      const delta = e.clientX - this.mouseStartPositionX;
      console.log(delta);
      this.infoPane.setAttribute('width', `${String(this.currentInfoPaneWidth + delta)}px`);
    }
  }
}
