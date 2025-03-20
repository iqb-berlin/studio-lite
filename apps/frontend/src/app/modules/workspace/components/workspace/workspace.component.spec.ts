// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { WorkspaceComponent } from './workspace.component';
import { environment } from '../../../../../environments/environment';

describe('WorkspaceComponent', () => {
  let component: WorkspaceComponent;
  let fixture: ComponentFixture<WorkspaceComponent>;

  @Component({
    selector: 'studio-lite-splitter',
    template: '',
    standalone: false
  })
  class MockStudioLiteSplitterComponent {}

  @Component({
    selector: 'studio-lite-splitter-pane',
    template: '',
    standalone: false
  })
  class MockStudioLiteSplitterPaneComponent {
    @Input() initialSize: number | 'auto' = 'auto';
    @Input() minSize: number = 0;
    @Input() maxSize!: number;
  }

  @Component({
    selector: 'studio-lite-units-area',
    template: '',
    standalone: false
  })
  class MockStudioLiteUnitsAreaComponent {
    @Input() selectedRouterLink!: number;
    @Input() navLinks!: string[];
  }

  @Component({
    selector: 'studio-lite-unit-data-area',
    template: '',
    standalone: false
  })
  class MockStudioLiteUnitDataAreaComponent {
    @Input() navTabs!: { name: string; duplicable: boolean }[];
    @Input() routingOutlet: string = 'primary'; // angular default
    @Input() secondaryRoutingOutlet!: string;
    @Input() pinIcon!: string;
    @Input() disabledRouterLink!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockStudioLiteSplitterComponent,
        MockStudioLiteSplitterPaneComponent,
        MockStudioLiteUnitsAreaComponent,
        MockStudioLiteUnitDataAreaComponent
      ],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
