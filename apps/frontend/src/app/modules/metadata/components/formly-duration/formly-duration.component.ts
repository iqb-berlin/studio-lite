import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core/public_api';

interface Duration {
  minutes: string;
  seconds: string;
}

interface FormlyDurationProps extends FormlyFieldProps {
  minValue?: number;
  maxValue?: number;
}

@Component({
  selector: 'studio-lite-formly-duration',
  templateUrl: './formly-duration.component.html',
  styleUrls: ['./formly-duration.component.scss']
})
export class FormlyDurationComponent extends FieldType<FieldTypeConfig<FormlyDurationProps>> implements OnInit {
  duration: Duration = { minutes: '0', seconds: '0' };
  minSeconds = 0;
  maxSeconds!: number;
  minMinutes = 0;
  maxMinutes!: number;
  ngOnInit(): void {
    this.convertSecondsToMinutes(this.formControl.value || 0);
    this.setMinMaxValues();
  }

  private setMinMaxValues(): void {
    const minValue = Number(this.props.minValue) || 0;
    if (minValue < 60) {
      this.minSeconds = minValue;
      this.minMinutes = 0;
    } else {
      this.minSeconds = 0;
      this.minMinutes = Math.floor(minValue / 60);
    }
    const maxValue = Number(this.props.maxValue) || 0;
    if (maxValue && maxValue < 60) {
      this.maxSeconds = maxValue;
      this.maxMinutes = 0;
    } else {
      this.maxSeconds = 60;
      if (maxValue) this.maxMinutes = Math.floor(maxValue / 60);
    }
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
