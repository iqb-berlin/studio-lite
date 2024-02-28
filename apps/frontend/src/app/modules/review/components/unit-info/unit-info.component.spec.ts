// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { UnitInfoComponent } from './unit-info.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

describe('UnitInfoComponent', () => {
  let component: UnitInfoComponent;
  let fixture: ComponentFixture<UnitInfoComponent>;

  @Component({ selector: 'studio-lite-unit-properties', template: '' })
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
  }

  @Component({ selector: 'studio-lite-unit-info-comments', template: '' })
  class MockUnitInfoComments {
    @Input() unitId!: number;
  }

  @Component({ selector: 'studio-lite-unit-info-coding', template: '' })
  class MockUnitInfoCoding {
    @Input() unitId!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitInfoComponent,
        MockUnitMetaDataComponent,
        MockUnitInfoComments,
        MockUnitInfoCoding,
        WrappedIconComponent
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
