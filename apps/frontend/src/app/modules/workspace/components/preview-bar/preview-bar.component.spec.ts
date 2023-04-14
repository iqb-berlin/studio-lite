// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../../../environments/environment';
import { PageData } from '../../models/page-data.interface';
import { Progress } from '../../models/types';
import { PreviewBarComponent } from './preview-bar.component';

describe('PreviewBarComponent', () => {
  let component: PreviewBarComponent;
  let fixture: ComponentFixture<PreviewBarComponent>;

  @Component({ selector: 'studio-lite-status-indication', template: '' })
  class MockStatusIndicationComponent {
    @Input() presentationProgress!: Progress;
    @Input() responseProgress!: Progress;
    @Input() hasFocus!: boolean;
  }

  @Component({ selector: 'studio-lite-page-navigation', template: '' })
  class MockPageNavigationComponent {
    @Input() pageList!: PageData[];
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PreviewBarComponent,
        MockStatusIndicationComponent,
        MockPageNavigationComponent
      ],
      imports: [
        MatTooltipModule,
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewBarComponent);
    component = fixture.componentInstance;
    component.pageList = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
