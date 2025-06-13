import { Injectable } from '@angular/core';
import { Duration } from '../models/duration.interface';

@Injectable({
  providedIn: 'root'
})
export class DurationService {
  static convertSecondsToMinutes(totalSeconds: number): Duration {
    const totalMinutes = totalSeconds / 60;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - minutes) * 60);
    return {
      minutes: DurationService.timeToString(minutes),
      seconds: DurationService.timeToString(seconds)
    };
  }

  private static timeToString(number: number): string {
    return (number < 10) ? `0${number}` : number.toString();
  }
}
