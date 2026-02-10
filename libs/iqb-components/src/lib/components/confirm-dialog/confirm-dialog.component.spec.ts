import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let component: ConfirmDialogComponent;

  const createComponent = (data: ConfirmDialogData): ConfirmDialogComponent => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    return component;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: '',
            content: '',
            confirmButtonLabel: '',
            showCancel: true
          } as ConfirmDialogData
        },
        {
          provide: MatDialog,
          useValue: 'browser'
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  it('should create a component', async () => {
    createComponent({
      title: '',
      content: '',
      confirmButtonLabel: '',
      showCancel: true
    });
    expect(component).toBeTruthy();
  });

  it('should take default properties for those which are omitted on #ngOnInit()', async () => {
    createComponent({
      title: '',
      content: '',
      confirmButtonLabel: '',
      showCancel: true
    });
    component.ngOnInit();
    expect(component.confirmData.title).toEqual('workspace.please-confirm!');
    expect(component.confirmData.confirmButtonLabel).toEqual('workspace.confirm!');
    expect(component.confirmData.content).toEqual('');
    expect(component.showCancel).toBe(true);
  });

  it('should keep provided values and hide cancel when showCancel is false', async () => {
    createComponent({
      title: 'Custom title',
      content: 'Custom content',
      confirmButtonLabel: 'Proceed',
      showCancel: false
    });
    component.ngOnInit();
    expect(component.confirmData.title).toEqual('Custom title');
    expect(component.confirmData.confirmButtonLabel).toEqual('Proceed');
    expect(component.confirmData.content).toEqual('Custom content');
    expect(component.showCancel).toBe(false);
  });
});
