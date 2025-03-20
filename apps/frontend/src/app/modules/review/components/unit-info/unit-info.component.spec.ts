// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { UnitInfoComponent } from './unit-info.component';

describe('UnitInfoComponent', () => {
  let component: UnitInfoComponent;
  let fixture: ComponentFixture<UnitInfoComponent>;

  @Component({ selector: 'studio-lite-unit-properties', template: '', standalone: false })
  class MockUnitMetaDataComponent {
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

  @Component({ selector: 'studio-lite-unit-info-comments', template: '', standalone: false })
  class MockUnitInfoComments {
    @Input() unitId!: number;
  }

  @Component({ selector: 'studio-lite-unit-info-coding', template: '', standalone: false })
  class MockUnitInfoCoding {
    @Input() unitId!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockUnitMetaDataComponent,
        MockUnitInfoComments,
        MockUnitInfoCoding
      ],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule,
        MatTooltipModule,
        HttpClientModule
      ],
      providers: [
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
