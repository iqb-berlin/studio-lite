import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PagingModeSelectionComponent } from './paging-mode-selection.component';
import { PreviewService } from '../../services/preview.service';

describe('PagingModeSelectionComponent', () => {
  let component: PagingModeSelectionComponent;
  let fixture: ComponentFixture<PagingModeSelectionComponent>;

  const mockPreviewService = {
    pagingMode: 'buttons'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PagingModeSelectionComponent,
        TranslateModule.forRoot(),
        FormsModule,
        MatTooltipModule
      ],
      providers: [
        { provide: PreviewService, useValue: mockPreviewService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PagingModeSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have paging modes defined', () => {
    expect(component.pagingModes).toEqual(['buttons', 'separate', 'concat-scroll', 'concat-scroll-snap']);
  });
});
