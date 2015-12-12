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

  /**
   * Get all sprites of a provided type.
   * 
   * TODO: This could be easily cached.
   * @param type
   */
  public static all<T extends Sprite>(type: { new (...args: any[]) : T } = Sprite as any): Group<T> {
    const typeName = ("" + type).split("function ")[1].split("(")[0];

    if (typeName === "Sprite") {
      return Sprites.list as Group<T>;
    }

    const sprites  = Sprites.list.items();
    const result   = new Group<T>();

    for (const s of sprites) {
      const name = Util.GetClassName(s);

      if (Util.GetClassName(s) === typeName) {
        result.add(s as T);
      }
    }

    return result;
  }

  public static add<T extends Sprite>(s: T): void {
    this.list.add(s);
  }

  public static remove<T extends Sprite>(s: T): void {
    this.list.remove(s);
  }
}