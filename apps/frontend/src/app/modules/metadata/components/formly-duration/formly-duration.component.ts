import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { FieldTypeConfig } from '@ngx-formly/core';

interface Duration {
  minutes: string;
  seconds: string;
}
@Component({
  selector: 'studio-lite-formly-duration',
  templateUrl: './formly-duration.component.html',
  styleUrls: ['./formly-duration.component.scss']
})
export class FormlyDurationComponent extends FieldType<FieldTypeConfig> implements OnInit {
  duration: Duration = { minutes: '0', seconds: '0' };
  ngOnInit(): void {
    this.convertSecondsToMinutes(this.formControl.value || 0);
  }

  private convertSecondsToMinutes(totalSeconds: number): void {
    const totalMinutes = totalSeconds / 60;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - minutes) * 60);
    this.displayDuration(minutes, 'minutes');
    this.displayDuration(seconds, 'seconds');
  }

  private convertMinutesToSeconds(): number {
    const minutes = Number(this.duration.minutes);
    const seconds: number = Number(this.duration.seconds);
    return minutes * 60 + seconds;
  }

  private displayDuration(number: number, control: string) {
    this.duration[control as keyof Duration] = (number < 10) ? `0${number}` : number.toString();
  }

  durationChange() {
    const total = this.convertMinutesToSeconds();
    this.convertSecondsToMinutes(total);
    this.formControl.setValue(total);
  }
}
