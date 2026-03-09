// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { PreviewBarComponent } from './preview-bar.component';
import { WorkspaceService } from '../../services/workspace.service';
import { PageNavigationComponent } from '../../../../components/page-navigation/page-navigation.component';
import { PagingModeSelectionComponent } from '../paging-mode-selection/paging-mode-selection.component';
import { StatusIndicationComponent } from '../status-indication/status-indication.component';

@Component({ selector: 'studio-lite-page-navigation', template: '', standalone: true })
class MockPageNavigationComponent {
  @Input() pageList: unknown;
  @Output() gotoPage = new EventEmitter();
}

@Component({ selector: 'studio-lite-paging-mode-selection', template: '', standalone: true })
class MockPagingModeSelectionComponent {}

@Component({ selector: 'studio-lite-status-indication', template: '', standalone: true })
class MockStatusIndicationComponent {
  @Input() presentationProgress: unknown;
  @Input() responseProgress: unknown;
  @Input() hasFocus: unknown;
}

describe('PreviewBarComponent', () => {
  let component: PreviewBarComponent;
  let fixture: ComponentFixture<PreviewBarComponent>;

  const mockWorkspaceService = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewBarComponent, TranslateModule.forRoot()],
      providers: [
        { provide: WorkspaceService, useValue: mockWorkspaceService }
      ]
    })
      .overrideComponent(PreviewBarComponent, {
        remove: {
          imports: [
            PageNavigationComponent,
            PagingModeSelectionComponent,
            StatusIndicationComponent
          ]
        },
        add: {
          imports: [
            MockPageNavigationComponent,
            MockPagingModeSelectionComponent,
            MockStatusIndicationComponent
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PreviewBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should take inputs', () => {
    component.pageList = [];
    component.playerApiVersion = 1;
    component.playerName = 'player';
    component.hasFocus = true;
    expect(component.playerName).toBe('player');
  });
});
