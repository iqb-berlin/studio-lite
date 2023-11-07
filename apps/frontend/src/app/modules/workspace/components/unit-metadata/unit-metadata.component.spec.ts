// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { UnitMetadataComponent } from './unit-metadata.component';
import { environment } from '../../../../../environments/environment';

describe('StartReviewButtonComponent', () => {
  let component: UnitMetadataComponent;
  let fixture: ComponentFixture<UnitMetadataComponent>;

  @Component({ selector: 'studio-lite-metadata', template: '' })
  class MockMetadataComponent {
    @Input() model!: any;
    @Input() language!: string;
    @Input() metadataLoader!: BehaviorSubject<any>;
    @Input() unitMDProfile!: string;
    @Input() itemMDProfile!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        UnitMetadataComponent,
        MockMetadataComponent
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
