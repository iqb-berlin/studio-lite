import { Component, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'studio-lite-copy-review-link-button',
  templateUrl: './copy-review-link-button.component.html',
  styleUrls: ['./copy-review-link-button.component.scss']
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
