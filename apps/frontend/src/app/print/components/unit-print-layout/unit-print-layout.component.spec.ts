// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { UnitPrintLayoutComponent } from './unit-print-layout.component';
import { environment } from '../../../../environments/environment';

describe('UnitPrintLayoutComponent', () => {
  let component: UnitPrintLayoutComponent;
  let fixture: ComponentFixture<UnitPrintLayoutComponent>;

  @Component({ selector: 'studio-lite-unit-print-header', template: '' })
  class MockUnitPrintHeaderComponent {
    @Input() name!: string | undefined | null;
    @Input() key!: string | undefined | null;
    @Input() description!: string | undefined | null;
    @Input() groupName!: string | undefined | null;
    @Input() player!: string;
    @Input() editor!: string | undefined | null;
    @Input() schemer!: string | undefined | null;
    @Input() lastChangedDefinition!: Date | undefined | null;
    @Input() lastChangedMetadata!: Date | undefined | null;
    @Input() lastChangedScheme!: Date | undefined | null;
  }

  @Component({ selector: 'studio-lite-unit-print-comments', template: '' })
  class MockUnitPrintCommentsComponent {
    @Input() unitId!: number;
    @Input() workspaceId!: number;
  }

  @Component({ selector: 'studio-lite-unit-print-coding', template: '' })
  class MockUnitPrintCodingComponent {
    @Input() unitId!: number;
    @Input() workspaceId!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitPrintLayoutComponent,
        MockUnitPrintHeaderComponent,
        MockUnitPrintCommentsComponent,
        MockUnitPrintCodingComponent
      ],
      imports: [
        HttpClientModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPrintLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
