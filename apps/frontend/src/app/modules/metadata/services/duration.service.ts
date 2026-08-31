import { Injectable } from '@angular/core';
import { Duration } from '../models/duration.interface';

/**
 * Turns a duration in seconds into the minutes and seconds a metadata field shows, both padded to
 * two digits so the field does not jump as the value changes.
 */
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
