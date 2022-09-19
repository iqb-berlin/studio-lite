import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BackendService as WriteBackendService } from '../backend.service';
import { BackendService as ReadBackendService } from '../../backend.service';

@Component({
  selector: 'app-app-logo',
  templateUrl: 'app-logo.component.html',
  styles: [
    '.example-chip-list {width: 100%;}',
    '.block-ident {margin-left: 40px}',
    '.warning-warning { color: darkgoldenrod }',
    '.logo-img {width: 100px; margin: 20px}',
    '.save-button {margin-bottom: 20px}'
  ]
})

export class AppLogoComponent implements OnInit, OnDestroy {
  configForm: UntypedFormGroup;
  dataChanged = false;
  private configDataChangedSubscription: Subscription | null = null;
  imageError: string | null = '';
  logoImageBase64 = '';

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private writeBackendService: WriteBackendService,
    private readBackendService: ReadBackendService
  ) {
    this.configForm = this.fb.group({
      alt: this.fb.control(''),
      bodyBackground: this.fb.control(''),
      boxBackground: this.fb.control('')
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateFormFields();
    });
  }

  updateFormFields(): void {
    this.readBackendService.getAppLogo().subscribe(appLogo => {
      if (this.configDataChangedSubscription !== null) {
        this.configDataChangedSubscription.unsubscribe();
        this.configDataChangedSubscription = null;
      }
      if (appLogo) {
        if (appLogo.data && appLogo.data.length > 0) this.logoImageBase64 = appLogo.data;
        this.configForm.setValue({
          alt: appLogo.alt,
          bodyBackground: appLogo.bodyBackground ? appLogo.bodyBackground : '',
          boxBackground: appLogo.boxBackground ? appLogo.boxBackground : ''
        });
      } else {
        this.logoImageBase64 = '';
        this.configForm.setValue({ alt: '', bodyBackground: '', boxBackground: '' });
      }
      this.configDataChangedSubscription = this.configForm.valueChanges.subscribe(() => {
        if (this.configForm) {
          this.dataChanged = true;
        }
      });
    });
  }

  saveData(): void {
    if (this.configForm) {
      this.writeBackendService.setAppLogo({
        data: this.logoImageBase64,
        alt: this.configForm.get('alt')?.value,
        bodyBackground: this.configForm.get('bodyBackground')?.value,
        boxBackground: this.configForm.get('boxBackground')?.value
      }).subscribe(isOk => {
        if (isOk) {
          this.snackBar.open(
            'Logo und Farben gespeichert - bitte neu laden!', 'Info', { duration: 3000 }
          );
          this.dataChanged = false;
        } else {
          this.snackBar.open('Konnte Logo und Farben nicht speichern', 'Fehler', { duration: 3000 });
        }
      });
    }
  }

  imgFileChange(fileInput: Event): void {
    const fileInputEventTarget = fileInput.target as HTMLInputElement;
    this.imageError = null;
    if (fileInputEventTarget.files && fileInputEventTarget.files[0]) {
      // todo check max values
      const maxSize = 20971520;
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
      const maxHeight = 15200;
      const maxWidth = 25600;

      if (fileInputEventTarget.files[0].size > maxSize) {
        this.imageError = `Datei zu groß ( > ${maxSize / 1000} Mb)`;
        return;
      }

      if (allowedTypes.indexOf(fileInputEventTarget.files[0].type) < 0) {
        const allowedImageTypesTruncated: string[] = [];
        allowedTypes.forEach(imgType => {
          allowedImageTypesTruncated.push(imgType.substr(5));
        });
        this.imageError = `Zulässige Datei-Typen: (${allowedImageTypesTruncated.join(', ')})`;
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && typeof e.target.result === 'string') {
          const image = new Image();
          image.src = e.target.result;
          image.onload = rs => {
            const imgTargetElement = rs.currentTarget as HTMLImageElement;
            const imgHeight = imgTargetElement.height;
            const imgWidth = imgTargetElement.width;
            if (imgHeight > maxHeight && imgWidth > maxWidth) {
              this.imageError = `Unzulässige Größe (maximal erlaubt: ${maxHeight}*${maxWidth}px)`;
              return false;
            }
            if (e.target && typeof e.target.result === 'string') {
              this.logoImageBase64 = e.target.result;
              this.dataChanged = true;
              return true;
            }
            return false;
          };
        }
      };
      reader.readAsDataURL(fileInputEventTarget.files[0]);
    }
  }

  removeLogoImg(): void {
    this.logoImageBase64 = '';
    this.dataChanged = true;
  }

  ngOnDestroy(): void {
    if (this.configDataChangedSubscription !== null) this.configDataChangedSubscription.unsubscribe();
  }
}
