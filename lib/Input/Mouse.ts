enum MouseEvents {
  MouseDown
}

class Mouse {
  /**
   * The current position of the mouse.
   */
  public position: Point;

  /**
   * Is the mouse down right now?
   */
  public down: boolean;
  
  public events: Events<MouseEvents>;

  constructor(stage: Stage) {
    this.position = new Point(0, 0);
    this.events   = new Events<MouseEvents>();

    stage.displayObject.on('mousemove', (e: any) => this.mousemove(e))
    stage.displayObject.on('mouseup',   (e: any) => this.mouseup(e))
    stage.displayObject.on('mousedown', (e: any) => this.mousedown(e))
  }

  mousemove(e: PIXI.interaction.InteractionEvent): void {
    this.position.x = e.data.global.x;
    this.position.y = e.data.global.y;
  }

  mousedown(e: PIXI.interaction.InteractionEvent): void {
    this.down = true;

    this.events.emit(MouseEvents.MouseDown, new Point(e.data.global.x, e.data.global.y));
  }

  mouseup(e: any): void {
    this.down = false;
  }
}