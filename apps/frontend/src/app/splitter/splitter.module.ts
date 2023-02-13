import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitterComponent } from './components/splitter/splitter.component';
import { SplitterPaneComponent } from './components/splitter-pane/splitter-pane.component';
import { SplitterGutterComponent } from './components/splitter-gutter/splitter-gutter.component';

@NgModule({
  declarations: [
    SplitterComponent,
    SplitterPaneComponent,
    SplitterGutterComponent
  ],
  imports: [CommonModule],
  exports: [
    SplitterComponent,
    SplitterPaneComponent
  ]
})
export class SplitterModule {}
