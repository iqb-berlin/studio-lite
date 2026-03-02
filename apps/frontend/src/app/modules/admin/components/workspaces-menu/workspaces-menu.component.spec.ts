import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Component, Input } from '@angular/core';
import { WorkspacesMenuComponent } from './workspaces-menu.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

describe('WorkspacesMenuComponent', () => {
  let component: WorkspacesMenuComponent;
  let fixture: ComponentFixture<WorkspacesMenuComponent>;

  @Component({ selector: 'studio-lite-wrapped-icon', template: '', standalone: true })
  class MockWrappedIconComponent {
    @Input() icon!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatTooltipModule,
        WorkspacesMenuComponent,
        MockWrappedIconComponent
      ]
    })
      .overrideComponent(WorkspacesMenuComponent, {
        remove: { imports: [WrappedIconComponent] },
        add: { imports: [MockWrappedIconComponent] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspacesMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit event when download is clicked', () => {
    const emitSpy = jest.spyOn(component.downloadWorkspacesReport, 'emit');
    component.downloadWorkspacesReport.emit(true);
    expect(emitSpy).toHaveBeenCalledWith(true);
  });
});
