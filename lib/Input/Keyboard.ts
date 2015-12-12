class KeyInfo {
  [key: string]: boolean;

  static Keys: string[] = "QWERTYUIOPASDFGHJKLZXCVBNM".split("").concat("Spacebar");

  W       : boolean;
  A       : boolean;
  S       : boolean;
  D       : boolean;
  Spacebar: boolean;
}

interface QueuedKeyboardEvent {
  isDown: boolean;
  event : KeyboardEvent;
}

class Keyboard {
  public down     = new KeyInfo();
  public justDown = new KeyInfo();

  private _queuedEvents: QueuedKeyboardEvent[] = [];

  constructor() {
    addEventListener("keydown", e => this.keyDown(e), false);
    addEventListener("keyup",   e => this.keyUp(e),   false);
  }

  private keyUp(e: KeyboardEvent) {
    // Since events happen asynchronously, we simply queue them up
    // to be processed on the next update cycle.

    this._queuedEvents.push({ event: e, isDown: false });
  }

  private keyDown(e: KeyboardEvent) {
    this._queuedEvents.push({ event: e, isDown: true });
  }

  private eventToKey(event: KeyboardEvent): string {
    const str = String.fromCharCode(event.keyCode || event.which);

    if (str === " ") {
      return "Spacebar";
    }

    if (str.length == 1) {
      return str.toUpperCase();
    }

    console.log("Odd case in Keyboard#stringToKey: ", str);

    return Util.ToTitleCase(str);
  }

  update(): void {
    for (const key of KeyInfo.Keys) {
      this.justDown[key] = false;
    }

    for (const queuedEvent of this._queuedEvents) {
      const key = this.eventToKey(queuedEvent.event);

      if (queuedEvent.isDown) {
        this.down[key]     = true;
        this.justDown[key] = true;
      } else {
        this.down[key]     = false;
      }
    }

    this._queuedEvents = [];
  }
}
