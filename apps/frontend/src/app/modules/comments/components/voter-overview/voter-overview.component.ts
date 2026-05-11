import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { UnitCommentVoterDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-voter-overview',
  standalone: false,
  templateUrl: './voter-overview.component.html',
  styleUrls: ['./voter-overview.component.scss']
})
export class VoterOverviewComponent {
  upVoters: string[];
  downVoters: string[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { voters: UnitCommentVoterDto[] }) {
    this.upVoters = data.voters.filter(v => v.vote === 'up').map(v => v.userName);
    this.downVoters = data.voters.filter(v => v.vote === 'down').map(v => v.userName);
  }
}
