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
    fixture.detectChanges();
  });

  // Without a player there is no one to tell that navigation is denied (#1951).
  it.each([
    ['no player', true, undefined, 3],
    ['a player of API version 2', true, window, 2],
    ['a player of API version 3', false, window, 3]
  ])('should set the navigation-denied button with %s to disabled: %s', (_, disabled, target, version) => {
    fixture.componentRef.setInput('postMessageTarget', target);
    fixture.componentRef.setInput('playerApiVersion', version);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('[data-cy="preview-bar-navigation-denied"]');
    expect(button.disabled).toBe(disabled);
  });
});
