import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../../workspace.service';

@Component({
  selector: 'studio-lite-unit-schemer',
  templateUrl: './unit-schemer.component.html',
  styleUrls: ['./unit-schemer.component.scss']
})
export class UnitSchemerComponent implements OnInit {
  variables!: never[] | undefined;

  constructor(private workspaceService: WorkspaceService) { }

  ngOnInit(): void {
    this.variables = this.workspaceService.unitDefinitionStore?.getData().variables;
  }
}
