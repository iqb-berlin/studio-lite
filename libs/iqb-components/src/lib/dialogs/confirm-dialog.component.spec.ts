import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogClose, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture;
  let component: {
    ngOnInit: () => void;
    confirmData: {
      title: string;
      confirmButtonLabel: string;
      content: string;
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ConfirmDialogComponent,
        MatDialogClose
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: '',
            content: '',
            confirmButtonLabel: ''
          }
        },
        {
          provide: MatDialog,
          useValue: 'browser'
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.debugElement.componentInstance;
  });

  it('should create a component', async () => {
    expect(component).toBeTruthy();
  });

  it('should take default properties for those which are omitted on #ngOnInit()', async () => {
    component.ngOnInit();
    expect(component.confirmData.title).toEqual('Bitte bestätigen!');
    expect(component.confirmData.confirmButtonLabel).toEqual('Bestätigen');
    expect(component.confirmData.content).toEqual('');
  });
});
