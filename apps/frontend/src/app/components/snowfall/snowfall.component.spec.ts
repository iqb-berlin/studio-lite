import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';

import { FADE_MS, SNOW_MS, SnowfallComponent } from './snowfall.component';

// Snow over the whole page costs the compositor a full frame each time; it falls for a minute only.
describe('SnowfallComponent', () => {
  let fixture: ComponentFixture<SnowfallComponent>;

  const layer = (): HTMLElement | null => fixture.nativeElement.querySelector('[data-cy="home-snowfall"]');

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  it('lets snow fall as the page opens', fakeAsync(() => {
    fixture = TestBed.createComponent(SnowfallComponent);
    fixture.detectChanges();

    expect(layer()?.querySelectorAll('.flake').length).toBeGreaterThan(0);
    expect(layer()?.classList).not.toContain('fading');
    fixture.destroy();
  }));

  it('fades the snow out after a minute', fakeAsync(() => {
    fixture = TestBed.createComponent(SnowfallComponent);
    fixture.detectChanges();
    tick(SNOW_MS);
    fixture.detectChanges();

    expect(layer()?.classList).toContain('fading');
    fixture.destroy();
  }));

  it('leaves nothing that moves once it has faded', fakeAsync(() => {
    fixture = TestBed.createComponent(SnowfallComponent);
    fixture.detectChanges();
    tick(SNOW_MS + FADE_MS);
    fixture.detectChanges();

    expect(layer()).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.flake').length).toBe(0);
  }));
});
