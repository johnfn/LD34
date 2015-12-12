/**
 * Main Game object.
 *
 * Put everything that needs to be loaded in the constructor. When loading is finished,
 * loadingComplete() will be called.
 * 
 */
class Game {
  private _width: number;
  get width(): number { return this._width; }

  private _height: number;
  get height(): number { return this._height; }

  private root: React.Component<any, {}>;
  private debug: Debug;
  private _renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;

  public stage: Stage;

  /**
   *  Just a convenient place to attach things so they don't move when the camera does.
   */
  public fixedStage: Sprite;

  constructor(width: number, height: number, element: HTMLElement, debug: boolean = false) {
    this._width = width;
    this._height = height;

    this._renderer = PIXI.autoDetectRenderer(width, height, {
      backgroundColor: 0xff0000
    });

    console.log(this._renderer.type)

    this.fixedStage = new Sprite();

    this.stage = new Stage(width, height, debug);
    Globals.initialize(this.stage, this.fixedStage);

    this.debug = new Debug();
    this.root = React.render(<Root stage={ this.stage } debug={ debug } />, element);
    
    this.stage.setRoot(this.root as any);

    const canvasContainer = React.findDOMNode(this.root).getElementsByClassName("content").item(0) as HTMLElement;
    canvasContainer.appendChild(this._renderer.view)

    this.stage.events.on(SpriteEvents.AddChild, () => this.onAddChild());

    this.fixedStage.addChild(this.stage);

    Globals.events.on(GlobalEvents.LoadingIsDone, () => this.loadingComplete());
  }

  loadingComplete(): void {
    console.log("woo?");
    // Kick off the main game loop.
    requestAnimationFrame(() => this.update());
  }

  /**
   * The core update loop.
  */
  update(): void {
    let children = Sprites.all().items();

    Globals.keyboard.update();

    for (const sprite of children) {
      for (const c of sprite.components) {
        c.preUpdate();
      }
    }

    for (const sprite of children) {
      sprite.update();

      for (const c of sprite.components) {
        c.update();
      }
    }

    Globals.physicsManager.update();

    for (const sprite of children) {
      sprite.postUpdate();

      for (const c of sprite.components) {
        c.postUpdate();
      }
    }

    for (const sprite of Globals._destroyList) {
      for (const c of sprite.components) {
        c.destroy();
      }

      Sprites.remove(sprite);
      sprite.actuallyDestroy();
    }

    Globals._destroyList = [];

    this._renderer.render(this.fixedStage.displayObject); 

    requestAnimationFrame(this.update.bind(this));
  }

  onAddChild(): void {
    setTimeout(() => this.root.forceUpdate(), 0);
  }
}

function inspect<T extends Sprite>(target: T, name: string) {
  target.addInspectableProperty(Util.GetClassName(target), name);
}
