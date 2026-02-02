import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { RequestMessageComponent } from './request-message.component';

describe('RequestMessageComponent', () => {
  describe('with default data', () => {
    let component: RequestMessageComponent;
    let fixture: ComponentFixture<RequestMessageComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          MatIconModule,
          TranslateModule.forRoot()
        ],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { source: 'test', messages: [] }
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(RequestMessageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should default to info message type', () => {
      expect(component.messageType).toBe('info');
    });
  });

  describe('with warning messages', () => {
    let component: RequestMessageComponent;
    let fixture: ComponentFixture<RequestMessageComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          MatIconModule,
          TranslateModule.forRoot()
        ],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              source: 'test',
              messages: [{ objectKey: 'obj1', messageKey: 'warning.test' }]
            }
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(RequestMessageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should detect warning message type', () => {
      expect(component.messageType).toBe('warning');
    });
  });

  describe('with error messages', () => {
    let component: RequestMessageComponent;
    let fixture: ComponentFixture<RequestMessageComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          MatIconModule,
          TranslateModule.forRoot()
        ],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              source: 'test',
              messages: [{ objectKey: 'obj1', messageKey: 'error.test' }]
            }
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(RequestMessageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should detect error message type', () => {
      expect(component.messageType).toBe('error');
    });
  });

  describe('with mixed warning and error messages', () => {
    let component: RequestMessageComponent;
    let fixture: ComponentFixture<RequestMessageComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          MatIconModule,
          TranslateModule.forRoot()
        ],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              source: 'test',
              messages: [
                { objectKey: 'obj1', messageKey: 'warning.test' },
                { objectKey: 'obj2', messageKey: 'error.critical' }
              ]
            }
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(RequestMessageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should prioritize error over warning', () => {
      expect(component.messageType).toBe('error');
    });
  });
});
