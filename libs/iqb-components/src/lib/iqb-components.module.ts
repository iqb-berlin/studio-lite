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
import { ConfirmDialogComponent, ConfirmDialogData } from './dialogs/confirm/confirm-dialog.component';
import { MessageDialogComponent, MessageDialogData, MessageType } from './dialogs/message/message-dialog.component';
import { BytesPipe } from './pipes/bytes.pipe';
import { ErrorHandler, IqbComponentsConfig, ServerError } from './iqb-components.classes';

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
    HttpClientModule
  ],
  entryComponents: [
    ConfirmDialogComponent,
    MessageDialogComponent
  ],
  declarations: [
    ConfirmDialogComponent,
    MessageDialogComponent,
    BytesPipe
  ],
  exports: [
    ConfirmDialogComponent,
    MessageDialogComponent,
    BytesPipe
  ]
})
export class IqbComponentsModule {
  // if config is needed: static forRoot(config: IqbComponentsConfig): ModuleWithProviders {
  static forRoot(): ModuleWithProviders<IqbComponentsModule> {
    return {
      ngModule: IqbComponentsModule,
      providers: [
        { provide: IqbComponentsConfig }
      ]
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
  ServerError,
  ErrorHandler,
  BytesPipe,
  MessageDialogData,
  MessageType,
  ConfirmDialogData
}; // IqbComponentsConfig
