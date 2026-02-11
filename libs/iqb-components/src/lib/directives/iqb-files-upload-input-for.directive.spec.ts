import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IqbFilesUploadQueueComponent, IqbFilesUploadInputForDirective } from '@studio-lite-lib/iqb-components';

@Component({
  standalone: true,
  imports: [IqbFilesUploadInputForDirective],
  template: '<input [iqbFilesUploadInputFor]="queue" />'
})
class HostComponent {
  queue = new IqbFilesUploadQueueComponent();
}

describe('IqbFilesUploadInputForDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  const createFileList = (files: File[]): FileList => {
    if (typeof DataTransfer !== 'undefined') {
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      return dataTransfer.files;
    }

    const fileList: { length: number; item: (index: number) => File | null; [key: number]: File } = {
      length: files.length,
      item: (index: number): File | null => files[index] ?? null
    };

    files.forEach((file, index) => {
      fileList[index] = file;
    });

    return fileList as unknown as FileList;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should add selected files to the queue and reset the input', () => {
    const host = fixture.componentInstance;
    const addSpy = jest.spyOn(host.queue, 'add');
    const inputDebug = fixture.debugElement.query(By.css('input'));
    const inputEl = inputDebug.nativeElement as HTMLInputElement;

    const files = [
      new File(['a'], 'a.txt', { type: 'text/plain' }),
      new File(['b'], 'b.txt', { type: 'text/plain' })
    ];

    Object.defineProperty(inputEl, 'files', {
      value: createFileList(files)
    });

    inputEl.value = 'C:\\fakepath\\a.txt';
    inputEl.dispatchEvent(new Event('change'));

    expect(addSpy).toHaveBeenCalledTimes(2);
    expect(addSpy).toHaveBeenNthCalledWith(1, files[0]);
    expect(addSpy).toHaveBeenNthCalledWith(2, files[1]);
    expect(inputEl.value).toBe('');
  });
});
