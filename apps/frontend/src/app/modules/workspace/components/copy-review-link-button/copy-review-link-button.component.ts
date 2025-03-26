import { Component, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-copy-review-link-button',
  templateUrl: './copy-review-link-button.component.html',
  styleUrls: ['./copy-review-link-button.component.scss'],
  imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class CopyReviewLinkButtonComponent {
  @Input() link!: string;
  @Input() unitCount!: number;
  @Input() passwordLength!: number;
  constructor(
    private translateService: TranslateService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}

  copyLinkToClipboard() {
    this.clipboard.copy(`${window.location.origin}/#/${this.link}`);
    this.snackBar.open(
      this.translateService.instant('workspace.link-copied'),
      '',
      { duration: 1000 }
    );
  }
}
