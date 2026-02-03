import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { State } from '../../../admin/models/state.type';
import { DeleteStateComponent, DeleteStateData } from './delete-state.component';

describe('DeleteStateComponent', () => {
  let component: DeleteStateComponent;
  let fixture: ComponentFixture<DeleteStateComponent>;

  const mockData: DeleteStateData = {
    title: 'Delete State',
    prompt: 'Are you sure?',
    state: { id: 1, label: 's1', color: 'red' } as State,
    okButtonLabel: 'Yes'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DeleteStateComponent,
        MatDialogModule,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockData
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DeleteStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize data', () => {
    expect(component).toBeTruthy();
    expect(component.typedData).toEqual(mockData);
  });
});
