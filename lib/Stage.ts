enum SpriteEvents {
  AddChild,
  MouseDown,
  MouseUp,
  ChangeParent
}

class Stage extends Sprite {
  public baseName: string = "Stage";
  public root: Root;

  private _width: number;
  private _height: number;

  /**
   * The width of the Stage. (readonly)
   */
  get width(): number { return this._width; }
  set width(val: number) { this._width = val; }

  /**
   * The height of the Stage. (readonly)
   */
  get height(): number { return this._height; }
  set height(val: number) { this._height = val; }

  /**
    Maps DisplayObjects to Sprites associated to those DisplayObjects.
  */
  public static doToSprite = new MagicDict<PIXI.DisplayObject, Sprite>();

  /**
   * Stage is the Sprite at the top of the display hierarchy.
   */
  constructor(width: number, height: number, debug: boolean = false) {
    super();

    this.width  = width;
    this.height = height;

    this.displayObject.hitArea = new PIXI.Rectangle(0, 0, width, height);
    this.displayObject.interactive = true;

    if (debug) {
      this.displayObject.on('mousedown', this.mousedown, this);
      // this.displayObject.on('mousemove', this.mousemove, this);
    }
  }

  setRoot(root: Root) {
    this.root = root;
  }

  findSpritesAt(point: Point): Sprite[] {
    var sprites = this.getAllSprites();

    return sprites.filter(o => {
      return point.x >= o.absolutePosition.x && point.x <= o.absolutePosition.x + o.width &&
             point.y >= o.absolutePosition.y && point.y <= o.absolutePosition.y + o.height;
    });
  }

  private mousedown(e: PIXI.interaction.InteractionEvent): void {
    let point  = new Point(e.data.global.x, e.data.global.y);
    let target = this.findTopmostSpriteAt(point, true);

    this.root.setTarget(target);
  }

  private currentMousedObject: Sprite = null;

  private mousemove(e: PIXI.interaction.InteractionEvent): void {
    let point = e.data.global;

    if (point.x < 0 || point.x > this.width || point.y < 0 || point.y > this.height) {
      return;
    }

    if (Debug.DEBUG_MODE) {
      let newMousedObject = this.findTopmostSpriteAt(point, true);

      if (newMousedObject != this.currentMousedObject) {
        if (newMousedObject != null) {
          newMousedObject.alpha = 0.9;
        }

        if (this.currentMousedObject != null) {
          this.currentMousedObject.alpha = 1.0;
        }
        this.currentMousedObject = newMousedObject;
      }
    }
  }

  public removeChild(sprite: Sprite) {
    this.displayObject.removeChild(sprite.displayObject);
  }
}
