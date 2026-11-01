import { signal } from '@angular/core';

/**
 * One save at a time, and what it sent. The answer to a save takes what was sent as saved, not what
 * is shown by then, so what is entered while the save is under way stays a change; and a second save
 * waits for the first, so that no answer overtakes another (#2094). {@link saving} locks the save
 * button meanwhile.
 */
export class SaveLock {
  private readonly savingState = signal(false);
  readonly saving = this.savingState.asReadonly();
  private sent = '';

  /** Begins a save of `sent`; false, and nothing begun, while another save is under way. */
  start(sent: unknown): boolean {
    if (this.savingState()) return false;
    this.sent = JSON.stringify(sent);
    this.savingState.set(true);
    return true;
  }

  /** Ends the save, whether it succeeded or not. */
  finish(): void {
    this.savingState.set(false);
  }

  /** Whether `current` differs from what the last save sent: once that is saved, it is still a change. */
  differsFromSent(current: unknown): boolean {
    return JSON.stringify(current) !== this.sent;
  }
}
