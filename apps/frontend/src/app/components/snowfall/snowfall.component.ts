import { Component } from '@angular/core';
import { snowCrystalPath } from '../../utils/snow-crystal.utils';
import { Flake, randomFlake } from '../../utils/snow-flake.utils';

const FLAKE_COUNT = 40;

/**
 * Snow falling behind the boxes of the start page: six-armed crystals and smaller dots. Only the
 * browser moves them, by a CSS animation; they are drawn once. Whoever asks the system for reduced
 * motion sees none (see the stylesheet), and the flakes catch no clicks.
 *
 * It snows as long as the start page is open. Snow over the whole page makes every frame a full one:
 * where frames are composed without a graphics card, that costs about half a CPU core (#2221).
 */
@Component({
  selector: 'studio-lite-snowfall',
  templateUrl: './snowfall.component.html',
  styleUrls: ['./snowfall.component.scss']
})
export class SnowfallComponent {
  readonly crystalPath = snowCrystalPath();
  readonly flakes: Flake[] = Array.from({ length: FLAKE_COUNT }, () => randomFlake());
}
