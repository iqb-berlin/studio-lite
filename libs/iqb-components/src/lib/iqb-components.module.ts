import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmDialogData } from './dialogs/confirm-dialog.component';
import { MessageDialogComponent, MessageDialogData, MessageType } from './dialogs/message-dialog.component';
import { BytesPipe } from './pipes/bytes.pipe';
import { ErrorHandler, IqbComponentsConfig, ServerError } from './iqb-components.classes';
import { IqbFilesUploadComponent } from './iqb-files/iqbFilesUpload/iqbFilesUpload.component';
import { IqbFilesUploadQueueComponent } from './iqb-files/iqbFilesUploadQueue/iqbFilesUploadQueue.component';
import { IqbFilesUploadInputForDirective } from './iqb-files/iqbFilesUploadInputFor/iqbFilesUploadInputFor.directive';

@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatExpansionModule,
        FormsModule,
        MatInputModule,
        HttpClientModule,
        MatProgressBarModule,
        MatCardModule,
        TranslateModule,
        ConfirmDialogComponent,
        MessageDialogComponent,
        BytesPipe,
        IqbFilesUploadComponent,
        IqbFilesUploadQueueComponent,
        IqbFilesUploadInputForDirective
    ],
    exports: [
        ConfirmDialogComponent,
        MessageDialogComponent,
        BytesPipe,
        IqbFilesUploadQueueComponent,
        IqbFilesUploadInputForDirective
    ]
})
export class IqbComponentsModule {
  // if config is needed: static forRoot(config: IqbComponentsConfig): ModuleWithProviders {
  static forRoot(): ModuleWithProviders<IqbComponentsModule> {
    return {
      ngModule: IqbComponentsModule,
      providers: [{ provide: IqbComponentsConfig }]
    };
  }

  static forChild(): ModuleWithProviders<IqbComponentsModule> {
    return {
      ngModule: IqbComponentsModule
    };
  }
}

export {
  ConfirmDialogComponent,
  MessageDialogComponent,
  IqbFilesUploadQueueComponent,
  IqbFilesUploadInputForDirective,
  ServerError,
  ErrorHandler,
  BytesPipe,
  MessageDialogData,
  MessageType,
  ConfirmDialogData
}; // IqbComponentsConfig
