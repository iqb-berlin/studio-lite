// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { Component, Input } from '@angular/core';
import { ExportUnitComponent } from './export-unit.component';
import { environment } from '../../../../environments/environment';

describe('ExportUnitComponent', () => {
  let component: ExportUnitComponent;
  let fixture: ComponentFixture<ExportUnitComponent>;

  @Component({ selector: 'select-unit-list', template: '' })
  class MockSelectUnitListComponent {
    @Input() workspace!: unknown;
    @Input() showGroups!: boolean;
    disabled!: number[];
    selectionCount!: number;
  }

  @Component({ selector: 'studio-lite-testcenter-data', template: '' })
  class MockTestcenterDataComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ExportUnitComponent,
        MockSelectUnitListComponent,
        MockTestcenterDataComponent
      ],
      imports: [
        MatDialogModule,
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
