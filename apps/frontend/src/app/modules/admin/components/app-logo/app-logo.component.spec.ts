import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AppLogoComponent } from './app-logo.component';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';

describe('AppLogoComponent', () => {
  let component: AppLogoComponent;
  let fixture: ComponentFixture<AppLogoComponent>;
  let readBackendService: jest.Mocked<ReadBackendService>;
  let writeBackendService: jest.Mocked<WriteBackendService>;
  let snackBar: jest.Mocked<MatSnackBar>;
  let translateService: TranslateService;

  beforeEach(async () => {
    const readBackendServiceMock = {
      getAppLogo: jest.fn()
    };

    const writeBackendServiceMock = {
      setAppLogo: jest.fn()
    };

    const snackBarMock = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        AppLogoComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        { provide: ReadBackendService, useValue: readBackendServiceMock },
        { provide: WriteBackendService, useValue: writeBackendServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    readBackendService = TestBed.inject(ReadBackendService) as jest.Mocked<ReadBackendService>;
    writeBackendService = TestBed.inject(WriteBackendService) as jest.Mocked<WriteBackendService>;
    snackBar = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
    translateService = TestBed.inject(TranslateService);

    readBackendService.getAppLogo.mockReturnValue(of({
      data: 'data:image/png;base64,test',
      bodyBackground: '#ffffff',
      boxBackground: '#f0f0f0'
    }));

    fixture = TestBed.createComponent(AppLogoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.configForm).toBeDefined();
    expect(component.configForm.get('bodyBackground')).toBeDefined();
    expect(component.configForm.get('boxBackground')).toBeDefined();
  });

  it('should initialize imageError as empty string', () => {
    expect(component.imageError).toBe('');
  });

  it('should load logo data on init', done => {
    fixture.detectChanges();
    setTimeout(() => {
      expect(readBackendService.getAppLogo).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should update form fields with loaded data', done => {
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.logoImageBase64).toBe('data:image/png;base64,test');
      expect(component.configForm.get('bodyBackground')?.value).toBe('#ffffff');
      expect(component.configForm.get('boxBackground')?.value).toBe('#f0f0f0');
      done();
    }, 100);
  });

  it('should set dataChanged flag when form values change', done => {
    fixture.detectChanges();
    setTimeout(() => {
      component.dataChanged = false;
      component.configForm.get('bodyBackground')?.setValue('#000000');
      setTimeout(() => {
        expect(component.dataChanged).toBe(true);
        done();
      }, 50);
    }, 100);
  });

  it('should save logo data successfully', done => {
    writeBackendService.setAppLogo.mockReturnValue(of(true));
    fixture.detectChanges();

    setTimeout(() => {
      component.dataChanged = true;
      component.logoImageBase64 = 'data:image/png;base64,newtest';
      component.saveData();

      expect(writeBackendService.setAppLogo).toHaveBeenCalledWith({
        data: 'data:image/png;base64,newtest',
        bodyBackground: '#ffffff',
        boxBackground: '#f0f0f0'
      });
      setTimeout(() => {
        expect(snackBar.open).toHaveBeenCalledWith(
          expect.any(String),
          '',
          { duration: 3000 }
        );
        expect(component.dataChanged).toBe(false);
        done();
      }, 50);
    }, 100);
  });

  it('should show error message when save fails', done => {
    writeBackendService.setAppLogo.mockReturnValue(of(false));
    fixture.detectChanges();

    setTimeout(() => {
      component.saveData();

      expect(writeBackendService.setAppLogo).toHaveBeenCalled();
      setTimeout(() => {
        expect(snackBar.open).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          { duration: 3000 }
        );
        done();
      }, 50);
    }, 100);
  });

  it('should remove logo image', () => {
    component.logoImageBase64 = 'data:image/png;base64,test';
    component.dataChanged = false;
    component.removeLogoImg();
    expect(component.logoImageBase64).toBe('');
    expect(component.dataChanged).toBe(true);
  });

  it('should validate file size on imgFileChange', () => {
    const translateSpy = jest.spyOn(translateService, 'instant').mockReturnValue('File too large');

    const largeFile = new File(['x'.repeat(21000000)], 'large.png', { type: 'image/png' });
    const event = {
      target: {
        files: [largeFile]
      }
    } as unknown as Event;

    component.imgFileChange(event);
    expect(component.imageError).toBeTruthy();
    expect(translateSpy).toHaveBeenCalledWith('logo.image-too-large', expect.any(Object));
  });

  it('should validate file type on imgFileChange', () => {
    const translateSpy = jest.spyOn(translateService, 'instant').mockReturnValue('Invalid type');

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = {
      target: {
        files: [invalidFile]
      }
    } as unknown as Event;

    component.imgFileChange(event);
    expect(component.imageError).toBeTruthy();
    expect(translateSpy).toHaveBeenCalledWith('logo.allowed-image-types', expect.any(Object));
  });

  it('should handle empty file input', () => {
    const event = {
      target: {
        files: null
      }
    } as unknown as Event;

    component.imageError = 'previous error';
    component.imgFileChange(event);
    expect(component.imageError).toBeNull();
  });
});
