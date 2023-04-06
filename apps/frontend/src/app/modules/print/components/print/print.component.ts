import {
  Component, ElementRef, OnInit, ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'studio-lite-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  unitIds!: number[];
  workspaceId!: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParamMap
      .subscribe(params => {
        this.unitIds = params.getAll('unitIds').map(unitId => Number(unitId));
        this.workspaceId = Number(params.get('workspaceId'));
      });
  }

  addToScrollPosition(summand: number) {
    this.scrollContainer.nativeElement.scrollTop += summand;
  }
}
