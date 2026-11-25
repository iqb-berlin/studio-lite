import {
  Component, computed, OnDestroy, OnInit, signal
} from '@angular/core';
import { Subject, takeUntil, timer } from 'rxjs';
import { snowCrystalPath } from '../../utils/snow-crystal.utils';
import { Flake, randomFlake } from '../../utils/snow-flake.utils';

const FLAKE_COUNT = 40;
// Snow over the whole page makes every frame a full one; on a computer that composes frames without a
// graphics card that costs about half a CPU core. It falls for a minute after the page opens, so that
// a start page left open does not cost it for hours.
export const SNOW_MS = 60_000;
// kept in step with the transition of .snowfall.fading in the stylesheet
export const FADE_MS = 3_000;

/**
 * Snow falling behind the boxes of the start page: six-armed crystals and smaller dots. Only the
 * browser moves them, by a CSS animation; they are drawn once. Whoever asks the system for reduced
 * motion sees none (see the stylesheet), and the flakes catch no clicks. After {@link SNOW_MS} the
 * snow fades out and is gone, and nothing on the page moves any more.
 */
@Component({
  selector: 'studio-lite-snowfall',
  templateUrl: './snowfall.component.html',
  styleUrls: ['./snowfall.component.scss']
})
export class SnowfallComponent implements OnInit, OnDestroy {
  readonly crystalPath = snowCrystalPath();
  readonly flakes: Flake[] = Array.from({ length: FLAKE_COUNT }, () => randomFlake());
  private readonly phase = signal<'falling' | 'fading' | 'over'>('falling');
  readonly fading = computed(() => this.phase() === 'fading');
  readonly over = computed(() => this.phase() === 'over');
  private ngUnsubscribe = new Subject<void>();

  ngOnInit(): void {
    timer(SNOW_MS)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.phase.set('fading'));
    timer(SNOW_MS + FADE_MS)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.phase.set('over'));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
