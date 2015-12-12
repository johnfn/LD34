enum MetaEvents {
  AddFirstEvent
}

type EventCB = (...args: any[]) => void;

class Events<T> {
  public metaEvents: Events<MetaEvents> = null;

  private _events = new MagicDict<T, MagicArray<EventCB>>(() => new MagicArray<EventCB>());
  private _numEvents = 0;

  constructor(dispatchMetaEvents: boolean = false) {
    if (dispatchMetaEvents) {
      this.metaEvents = new Events<MetaEvents>();
    }
  }

  emit(event: T, ...args: any[]): void {
    for (var cb of this._events.get(event)) {
      cb(...args)
    }
  }

  on(event: T, cb: EventCB): void {
    this._events.get(event).push(cb);

    if (this.metaEvents != null && ++this._numEvents == 1) {
      this.metaEvents.emit(MetaEvents.AddFirstEvent);
    }
  }

  off(event: T, cb: EventCB): void {
    this._events.get(event).remove(cb);
  }
}
