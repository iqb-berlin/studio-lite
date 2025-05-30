// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { provideHttpClient } from '@angular/common/http';
import { UnitPrintLayoutComponent } from './unit-print-layout.component';
import { environment } from '../../../../../environments/environment';

describe('UnitPrintLayoutComponent', () => {
  let component: UnitPrintLayoutComponent;
  let fixture: ComponentFixture<UnitPrintLayoutComponent>;

  @Pipe({ name: 'include', standalone: false })
  class MockIncludePipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(): boolean {
      return true;
    }
  }

  @Component({ selector: 'studio-lite-unit-properties', template: '', standalone: false })
  class MockUnitMetaDataComponent {
    @Input() workspaceGroupId!: number;
    @Input() state!: string | undefined | null;
    @Input() name!: string | undefined | null;
    @Input() key!: string | undefined | null;
    @Input() description!: string | undefined | null;
    @Input() reference!: string | undefined | null;
    @Input() transcript!: string | undefined | null;
    @Input() groupName!: string | undefined | null;
    @Input() player!: string;
    @Input() editor!: string | undefined | null;
    @Input() schemer!: string | undefined | null;
    @Input() lastChangedDefinition!: Date | undefined | null;
    @Input() lastChangedMetadata!: Date | undefined | null;
    @Input() lastChangedScheme!: Date | undefined | null;
    @Input() lastChangedDefinitionUser!: string | undefined | null;
    @Input() lastChangedMetadataUser!: string | undefined | null;
    @Input() lastChangedSchemeUser!: string | undefined | null;
  }

  @Component({ selector: 'studio-lite-print-metadata', template: '', standalone: false })
  class MockUnitPrintMetaDateComponent {
    @Input() metadata!: UnitMetadataValues | null;
  }

  @Component({ selector: 'studio-lite-unit-print-comments', template: '', standalone: false })
  class MockUnitPrintCommentsComponent {
    @Input() unitId!: number;
    @Input() workspaceId!: number;
  }

  @Component({ selector: 'studio-lite-unit-print-coding', template: '', standalone: false })
  class MockUnitPrintCodingComponent {
    @Input() unitId!: number;
    @Input() workspaceId!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockUnitPrintMetaDateComponent,
        MockUnitMetaDataComponent,
        MockUnitPrintCommentsComponent,
        MockUnitPrintCodingComponent,
        MockIncludePipe
      ],
      providers: [
        provideHttpClient(),
        {
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
