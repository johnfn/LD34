enum GlobalEvents {
  LoadingIsDone
}

class Globals {
  public static physicsManager: PhysicsManager;
  /**
   * Reference to the first stage created.
   */
  public static stage: Stage;

  public static fixedStage: Sprite;

  public static keyboard: Keyboard;

  public static mouse: Mouse;

  /**
   * Reference to the currently active camera.
   */
  public static camera: Camera;

  public static initialize(stage: Stage, fixedStage: Sprite) {
    Globals.physicsManager = new PhysicsManager();
    Globals.keyboard       = new Keyboard();
    Globals.mouse          = new Mouse(stage);
    Globals.camera         = new Camera(stage);
    Globals.stage          = Globals.stage || stage;
    Globals.fixedStage     = Globals.fixedStage || fixedStage;

    Globals.camera.x = stage.width / 2;
    Globals.camera.y = stage.height / 2;
    Globals.camera.addParallaxLayer(Globals.stage, 1);
  }

  public static events = new Events<GlobalEvents>();

  public static _destroyList: Sprite[] = [];

  private static _thingsThatAreLoading: number = 0;

  public static get thingsThatAreLoading(): number { return Globals._thingsThatAreLoading; }
  public static set thingsThatAreLoading(value: number) {
    Globals._thingsThatAreLoading = value;

    if (value === 0) {
      Globals.events.emit(GlobalEvents.LoadingIsDone);
    }
  }
}

class Sprites {
  public static list = new Group<Sprite>();

  private static _all: Sprite[] = [];
  private static _cache: { [key: string]: Group<Sprite> } = {};

  /**
   * Get all sprites of a provided type.
   * @param type
   */
  public static all<T extends Sprite>(type: { new (...args: any[]) : T } = Sprite as any): Group<T> {
    const typeName = ("" + type).split("function ")[1].split("(")[0];

    if (typeName === "Sprite") {
      return Sprites.list as Group<T>;
    }

    return Sprites._cache[typeName] as Group<T>;
  }

  public static add<T extends Sprite>(s: T): void {
    const typeName = Util.GetClassName(s);

    this.list.add(s);
    this._all.push(s);

    if (!Sprites._cache[typeName]) {
      Sprites._cache[typeName] = new Group<Sprite>();
    }

    Sprites._cache[typeName].add(s);
  }

  public static by(fn: (s: Sprite) => boolean): Group<Sprite> {
    const result: Sprite[] = [];

    for (let i = 0; i < this._all.length; i++) {
      const item = this._all[i];

      if (fn(item)) result.push(item);
    }

    return new Group(result);
  }

  public static remove<T extends Sprite>(s: T): void {
    const typeName = Util.GetClassName(s);

    this._all.splice(this._all.indexOf(s), 1);
    this.list.remove(s);

    Sprites._cache[typeName].remove(s);
  }
}