import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MatSnackBar, MatSnackBarModule, MatSnackBarRef, TextOnlySnackBar
} from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { createMock } from '@golevelup/ts-jest';
import { UnitRichNoteTagDto } from '@studio-lite-lib/api-dto';
import { UnitRichNoteTagsConfigComponent } from './unit-rich-note-tags-config.component';
import { BackendService } from '../../services/backend.service';

describe('UnitRichNoteTagsConfigComponent', () => {
  let component: UnitRichNoteTagsConfigComponent;
  let fixture: ComponentFixture<UnitRichNoteTagsConfigComponent>;
  let backendServiceMock: jest.Mocked<BackendService>;

  beforeEach(async () => {
    backendServiceMock = createMock<BackendService>({
      getUnitRichNoteTagsConfig: jest.fn().mockReturnValue(of([])),
      setUnitRichNoteTags: jest.fn().mockReturnValue(of(true))
    });

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        UnitRichNoteTagsConfigComponent
      ],
      providers: [
        { provide: BackendService, useValue: backendServiceMock },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitRichNoteTagsConfigComponent);
    component = fixture.componentInstance;
  });

  const fieldValues = (): string[] => Array.from(fixture.nativeElement.querySelectorAll('input'))
    .map(input => (input as HTMLInputElement).value);

  const infoShown = (): boolean => fixture.nativeElement.querySelector('.info') !== null;

  it('should load config on init', () => {
    const config = ['http://test.url'];
    backendServiceMock.getUnitRichNoteTagsConfig.mockReturnValue(of(config as string[]));
    component.loadData();
    expect(backendServiceMock.getUnitRichNoteTagsConfig).toHaveBeenCalled();
    expect(component.urls.at(0).value).toBe('http://test.url');
  });

  // Saving the empty field shown after a failed load would replace the stored URLs (#1993).
  it('should offer no saving of URLs that could not be loaded', () => {
    backendServiceMock.getUnitRichNoteTagsConfig.mockReturnValue(of(null));
    component.isGlobal = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-cy="admin-unit-rich-note-tags-not-loaded"]'))
      .not.toBeNull();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('should add and remove urls', () => {
    component.addUrl('http://url1');
    expect(component.urls.length).toBe(1);
    expect(component.urls.at(0).value).toBe('http://url1');

    component.addUrl('http://url2');
    expect(component.urls.length).toBe(2);

    component.removeUrl(0);
    expect(component.urls.length).toBe(1);
    expect(component.urls.at(0).value).toBe('http://url2');
  });

  it('should save data when form is valid', () => {
    const urls = ['http://test.url'];
    component.urls.clear();
    component.addUrl(urls[0]);
    component.saveData();
    expect(backendServiceMock.setUnitRichNoteTags).toHaveBeenCalledWith(urls as string[]);
  });

  it('should not reset form in ngOnChanges if config is semantically identical', () => {
    component.config = ['http://url1'];
    component.urls.clear();
    component.addUrl('http://url1');

    const updateFormSpy = jest.spyOn(component as unknown as { updateForm: (c: unknown) => void }, 'updateForm');

    // Simulate input change with semantically identical value
    component.ngOnChanges({
      config: {
        currentValue: ['http://url1'],
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(updateFormSpy).not.toHaveBeenCalled();

    // Now change to a different value
    component.config = ['http://url2'];
    component.ngOnChanges({
      config: {
        currentValue: ['http://url2'],
        previousValue: ['http://url1'],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(updateFormSpy).toHaveBeenCalledWith(['http://url2']);
  });

  const tag: UnitRichNoteTagDto = { id: 'tag-1', label: [{ lang: 'de', value: 'Tag 1' }] };

  // The settings of a group hold URLs, older ones the tags themselves.
  it.each<[string, UnitRichNoteTagDto[] | string[] | null, string[]]>([
    ['its urls without the empty ones', ['http://a.org', '', ' ', 'http://b.org'], ['http://a.org', 'http://b.org']],
    ['tags stored as such in one field', [tag], [JSON.stringify([tag])]],
    ['no field for a group without urls', null, []]
  ])('should show %s', (_, config, fields) => {
    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();

    expect(fieldValues()).toEqual(fields);
    expect(infoShown()).toBe(fields.length === 0);
  });

  // The settings of a group arrive after the form was created, when the page is opened directly.
  it('should show the urls of a group that arrive after the form was created', () => {
    fixture.componentRef.setInput('config', null);
    fixture.detectChanges();

    fixture.componentRef.setInput('config', ['http://a.org', 'http://b.org']);
    fixture.detectChanges();

    expect(fieldValues()).toEqual(['http://a.org', 'http://b.org']);
  });

  it('should not save an entry that is no url', () => {
    component.addUrl('ftp://a.org');

    component.saveData();

    expect(backendServiceMock.setUnitRichNoteTags).not.toHaveBeenCalled();
  });

  it('should say when the urls could not be saved', () => {
    const snackBar = fixture.debugElement.injector.get(MatSnackBar);
    jest.spyOn(snackBar, 'open').mockReturnValue(createMock<MatSnackBarRef<TextOnlySnackBar>>());
    backendServiceMock.setUnitRichNoteTags.mockReturnValue(of(false));
    component.addUrl('http://a.org');

    component.saveData();

    expect(snackBar.open).toHaveBeenCalledWith('workspace.tags-saved-error', 'error', { duration: 3000 });
    expect(component.dataChanged).toBe(true);
  });
});
