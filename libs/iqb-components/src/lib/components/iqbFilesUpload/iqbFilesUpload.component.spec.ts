import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpEventType, HttpProgressEvent, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { IqbFilesUploadComponent } from './iqbFilesUpload.component';
import { UploadStatus } from '../../iqb-files/iqb-files-classes';

describe('IqbFilesUploadComponent', () => {
  let fixture: ComponentFixture<IqbFilesUploadComponent>;
  let component: IqbFilesUploadComponent;
  let httpMock: HttpTestingController;

  const createComponent = (): void => {
    fixture = TestBed.createComponent(IqbFilesUploadComponent);
    component = fixture.componentInstance;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and stay ready when fileAlias is missing', () => {
    createComponent();
    component.file = new File(['abc'], 'test.txt', { type: 'text/plain' });
    component.fileAlias = undefined;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.status).toBe(UploadStatus.ready);
    expect(component.statustext).toBe('Bereit');
  });

  it('should update progress and emit removal on successful upload', () => {
    createComponent();
    component.httpUrl = '/upload';
    component.file = new File(['abc'], 'test.txt', { type: 'text/plain' });

    const removeSpy = jest.spyOn(component.removeFileRequestEvent, 'emit');

    fixture.detectChanges();

    const req = httpMock.expectOne('/upload');
    expect(req.request.method).toBe('POST');

    req.event({
      type: HttpEventType.UploadProgress,
      loaded: 5,
      total: 10
    } as HttpProgressEvent);

    expect(component.progressPercentage).toBe(50);
    expect(component.status).toBe(UploadStatus.busy);

    req.flush('ok');

    expect(component.status).toBe(UploadStatus.ok);
    expect(removeSpy).toHaveBeenCalledWith(component);
  });

  it('should surface error message on unauthorized response', () => {
    createComponent();
    component.httpUrl = '/upload';
    component.file = new File(['abc'], 'test.txt', { type: 'text/plain' });

    fixture.detectChanges();

    const req = httpMock.expectOne('/upload');
    req.flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(component.status).toBe(UploadStatus.error);
    expect(component.statustext).toContain('Zugriff verweigert');
  });
});
