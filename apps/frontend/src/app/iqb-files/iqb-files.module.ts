import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IqbComponentsModule } from '@studio-lite/iqb-components';
import { IqbFilesUploadInputForDirective } from './iqbFilesUploadInputFor/iqbFilesUploadInputFor.directive';
import { IqbFilesUploadQueueComponent } from './iqbFilesUploadQueue/iqbFilesUploadQueue.component';
import { IqbFilesUploadComponent } from './iqbFilesUpload/iqbFilesUpload.component';

@NgModule({
  imports: [
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatCardModule,
    HttpClientModule,
    CommonModule,
    IqbComponentsModule
  ],
  declarations: [
    IqbFilesUploadComponent,
    IqbFilesUploadQueueComponent,
    IqbFilesUploadInputForDirective
  ],
  exports: [
    IqbFilesUploadQueueComponent,
    IqbFilesUploadInputForDirective
  ]
})
export class IqbFilesModule { }
