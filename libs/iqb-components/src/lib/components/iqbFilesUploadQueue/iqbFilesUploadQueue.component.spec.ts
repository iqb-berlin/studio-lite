import { QueryList } from '@angular/core';
import { IqbFilesUploadQueueComponent } from './iqbFilesUploadQueue.component';
import { IqbFilesUploadComponent } from '../iqbFilesUpload/iqbFilesUpload.component';
import { UploadStatus } from '../../enums/upload-status.enum';

describe('IqbFilesUploadQueueComponent', () => {
  let component: IqbFilesUploadQueueComponent;

  beforeEach(() => {
    component = new IqbFilesUploadQueueComponent();
  });

  it('should add and clear files', () => {
    const file = new File(['a'], 'a.txt', { type: 'text/plain' });

    component.add(file);
    expect(component.files).toEqual([file]);

    component.removeAll();
    expect(component.files.length).toBe(0);
  });

  it('should remove a file by id', () => {
    const file = new File(['a'], 'a.txt', { type: 'text/plain' });
    const upload = { id: 0 } as IqbFilesUploadComponent;

    component.files = [file];
    component.removeFile(upload);

    expect(component.files.length).toBe(0);
  });

  it('should emit completion when all uploads are done', () => {
    const uploadCompleteSpy = jest.spyOn(component.uploadCompleteEvent, 'emit');
    const queryList = new QueryList<IqbFilesUploadComponent>();

    queryList.reset([
      { status: UploadStatus.ok } as IqbFilesUploadComponent,
      { status: UploadStatus.error } as IqbFilesUploadComponent
    ]);

    component.fileUploads = queryList;
    component.analyseStatus();

    expect(uploadCompleteSpy).toHaveBeenCalled();
    expect(component.disableClearButton).toBe(false);
  });

  it('should not emit completion while an upload is busy', () => {
    const uploadCompleteSpy = jest.spyOn(component.uploadCompleteEvent, 'emit');
    const queryList = new QueryList<IqbFilesUploadComponent>();

    queryList.reset([
      { status: UploadStatus.busy } as IqbFilesUploadComponent,
      { status: UploadStatus.ok } as IqbFilesUploadComponent
    ]);

    component.fileUploads = queryList;
    component.analyseStatus();

    expect(uploadCompleteSpy).not.toHaveBeenCalled();
    expect(component.disableClearButton).toBe(true);
  });
});
