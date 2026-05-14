import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock } from '@golevelup/ts-jest';
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
        NoopAnimationsModule,
        UnitRichNoteTagsConfigComponent
      ],
      providers: [
        { provide: BackendService, useValue: backendServiceMock },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitRichNoteTagsConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load config on init', () => {
    const config = ['http://test.url'];
    backendServiceMock.getUnitRichNoteTagsConfig.mockReturnValue(of(config as string[]));
    component.loadData();
    expect(backendServiceMock.getUnitRichNoteTagsConfig).toHaveBeenCalled();
    expect(component.urls.at(0).value).toBe('http://test.url');
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
});
