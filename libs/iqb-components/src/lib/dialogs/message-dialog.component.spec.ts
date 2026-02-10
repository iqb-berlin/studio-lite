import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MessageDialogComponent, MessageDialogData, MessageType } from './message-dialog.component';

describe('MessageDialogComponent', () => {
  let fixture: ComponentFixture<MessageDialogComponent>;
  let component: MessageDialogComponent;

  const createComponent = (data: MessageDialogData): MessageDialogComponent => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    fixture = TestBed.createComponent(MessageDialogComponent);
    component = fixture.componentInstance;
    return component;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            type: MessageType.error,
            title: '',
            content: '',
            closeButtonLabel: ''
          } as MessageDialogData
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  it('should create a component', async () => {
    createComponent({
      type: MessageType.error,
      title: '',
      content: '',
      closeButtonLabel: ''
    });
    expect(component).toBeTruthy();
  });

  it('should take default properties for error messages on #ngOnInit()', async () => {
    createComponent({
      type: MessageType.error,
      title: '',
      content: '',
      closeButtonLabel: ''
    });
    component.ngOnInit();
    expect(component.messageData.title).toEqual('Achtung: Fehler');
    expect(component.messageData.closeButtonLabel).toEqual('Schließen');
    expect(component.messageData.content).toEqual('');
  });

  it('should take default properties for warning messages on #ngOnInit()', async () => {
    createComponent({
      type: MessageType.warning,
      title: '',
      content: '',
      closeButtonLabel: ''
    });
    component.ngOnInit();
    expect(component.messageData.title).toEqual('Achtung: Warnung');
    expect(component.messageData.closeButtonLabel).toEqual('Schließen');
  });

  it('should take default properties for info messages on #ngOnInit()', async () => {
    createComponent({
      type: MessageType.info,
      title: '',
      content: '',
      closeButtonLabel: ''
    });
    component.ngOnInit();
    expect(component.messageData.title).toEqual('Hinweis');
    expect(component.messageData.closeButtonLabel).toEqual('Schließen');
  });

  it('should keep provided values on #ngOnInit()', async () => {
    createComponent({
      type: MessageType.warning,
      title: 'Custom title',
      content: 'Custom content',
      closeButtonLabel: 'Dismiss'
    });
    component.ngOnInit();
    expect(component.messageData.title).toEqual('Custom title');
    expect(component.messageData.closeButtonLabel).toEqual('Dismiss');
    expect(component.messageData.content).toEqual('Custom content');
  });
});
