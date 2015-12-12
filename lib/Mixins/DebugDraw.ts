class DebugDraw extends Component<Sprite> {
  public events: Events<SpriteEvents> = new Events<SpriteEvents>(true);

  private _clickableShapes = new MagicArray<Polygon>();

  constructor(private _target: Sprite,
              public _graphics: PIXI.Graphics) {
    super()

    /* Add mouse events, but listen to MetaEvents.AddFirstEvent so we 
       aren't adding interactive events when there's no need to. */
    this.events.metaEvents.on(MetaEvents.AddFirstEvent, () => {
      let dObj = this._target.displayObject;

      dObj.interactive = true;
      dObj.hitArea = new PIXI.Rectangle(-50, -50, 200, 200);

      dObj.on("mousedown", (e: PIXI.interaction.InteractionEvent) => {
        let pos = e.data.getLocalPosition(dObj, e.data.global.clone());

        if (this._areCoordsInBounds(pos)) {
          this.events.emit(SpriteEvents.MouseDown, pos);

          e.stopPropagation();
        }
      });

      dObj.on("mouseup", (e: PIXI.interaction.InteractionEvent) => {
        let pos = e.data.getLocalPosition(dObj, e.data.global.clone());

        this.events.emit(SpriteEvents.MouseUp, pos);

        e.stopPropagation();
      });
    });
  }

  private _areCoordsInBounds(point: PIXI.Point): boolean {
    for (var polygon of this._clickableShapes) {
      if (polygon.contains(point)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Draw a line. Meant for debugging purposes only.
   */
  public drawLine(x0: number, y0: number, x1: number, y1: number, color: number = 0xffffff, alpha: number = 1): void {
    this._graphics.lineStyle(1, color, alpha);

    this._graphics.moveTo(x0, y0);
    this._graphics.lineTo(x1, y1);
  }

  /**
   * Draw a point. Meant for debugging purposes only.
   */
  public drawPoint(x: number, y: number, color: number = 0xff0000): void {
    this.drawLine(x, 0, x, Globals.stage.height, color);
    this.drawLine(0, y, Globals.stage.width, y, color);
  }

  /**
   * Draw a shape.
   */
  public drawShape(polygon: Polygon, color: number = 0xffffff): void {
    let lastPoint = polygon.points[polygon.points.length - 1];

    this._graphics.beginFill(color);
    this._graphics.lineColor = 0;

    this._graphics.moveTo(lastPoint.x, lastPoint.y);

    for (var point of polygon.points) {
      this._graphics.lineTo(point.x, point.y);
    }

    this._graphics.endFill();

    this._clickableShapes.push(polygon);
  }

  public drawRectangle(x0: number, y0: number, x1: number, y1: number): void {
    let white = 0xffffff;
    let alpha = .2;

    let stageWidth = Globals.stage.width;
    let stageHeight = Globals.stage.height;

    /*
          (1)        (2)
          x0         x1
          |          |
          |          |        
          |          |
   y0-----*----------*-------  (3)
          |          |
          |          |         
          |          |
   y1-----*----------*-------  (4)
          |          |
          |          |           
          |          |

    */

    // (1)

    this.drawLine(x0, 0, x0, stageHeight, white, alpha);
    this.drawLine(x0, y0, x0, y1);

    // (2)

    this.drawLine(x1, 0, x1, stageHeight, white, alpha);
    this.drawLine(x1, y0, x1, y1);

    // (3)

    this.drawLine(0, y0, stageWidth, y0, white, alpha);
    this.drawLine(x0, y0, x1, y0);

    // (4)

    this.drawLine(0, y1, stageWidth, y1, white, alpha);
    this.drawLine(x0, y1, x1, y1);
  }

  public draw(item: Ray | Point | Polygon | PIXI.Rectangle, color: number = 0xff0000, alpha: number = 1) {
    if (item instanceof Ray) {
      this.drawLine(item.x0, item.y0, item.x1, item.y1, color, alpha)
    } else if (item instanceof Point) {
      this.drawPoint(item.x, item.y, color);
    } else if (item instanceof Polygon) {
      this.drawShape(item, color);
    } else if (item instanceof PIXI.Rectangle) {
      this.drawRectangle(item.x, item.y, item.x + item.width, item.y + item.height);
    } else {
      console.error("I don't know how to draw that shape.")
    }
  }

  /**
    Removes everything on the graphics object. Meant for debugging purposes only.
  */
  public clear(): void {
    this._graphics.clear();
  }

  public preUpdate(): void {
    this.clear();
  }

  public postUpdate(): void {
    
  }

  public update(): void {
    
  }
}