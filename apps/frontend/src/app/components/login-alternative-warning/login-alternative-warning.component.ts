import {
  Component
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';

@Component({
  selector: 'studio-lite-login-alternative-warning',
  templateUrl: './login-alternative-warning.html',
  styleUrls: ['./login-alternative-warning.scss'],
  standalone: true,
  imports: [MatDialogContent, MatIcon, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})

export class LoginAlternativeWarningComponent {
}
