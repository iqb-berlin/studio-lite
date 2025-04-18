import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Component, Input } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { DeleteStateComponent } from './delete-state.component';

describe('DeleteStateComponent', () => {
  let component: DeleteStateComponent;
  let fixture: ComponentFixture<DeleteStateComponent>;

  @Component({ selector: 'studio-lite-search-filter', template: '', standalone: false })
  class MockSearchFilterComponent {
    @Input() title!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockSearchFilterComponent],
      imports: [
        MatDialogModule,
        MatTableModule,
        MatCheckboxModule,
        MatSnackBarModule,
        MatListModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteStateComponent);
    component = fixture.componentInstance;
    component.typedData = {
      title: 'title',
      prompt: '',
      okButtonLabel: 'ok',
      state: {
        id: 0, label: 'label', color: 'red'
      }
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
