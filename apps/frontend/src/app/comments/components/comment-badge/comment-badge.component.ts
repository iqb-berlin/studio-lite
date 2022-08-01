import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'studio-lite-comment-badge',
  templateUrl: './comment-badge.component.html',
  styleUrls: ['./comment-badge.component.scss']
})
export class CommentBadgeComponent implements OnInit {
  @Input() userName!: string;
  @Input() ownComment!: boolean;

  userAcronym: string = '';

  ngOnInit(): void {
    const userNames = this.userName.toUpperCase().split(', ');
    this.userAcronym = userNames.length > 1 ? `${userNames[1][0]}${userNames[0][0]}` : userNames[0].substring(0, 2);
  }
}
