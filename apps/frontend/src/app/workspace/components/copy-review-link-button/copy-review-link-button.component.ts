import { Component, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}

  copyLinkToClipboard() {
    this.clipboard.copy(`${window.location.origin}/#/${this.link}`);
    this.snackBar.open(
      'Link in die Zwischenablage kopiert.', '', { duration: 1000 }
    );
  }
}
