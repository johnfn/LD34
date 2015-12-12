class Camera {
  private _stage: Stage;

  private _x: number;
  private _y: number;

  public get x(): number { return this._x; }
  public set x(value: number) {
    this._x = value;
    this._stage.x = this._stage.width / 2 - value;
  }

  public get y(): number { return this._y; }
  public set y(value: number) {
    this._y = value;
    this._stage.y = this._stage.height / 2 - value;
  }

  public get top(): number { return this._x - this._stage.width / 2; }

  public get left(): number { return this._y - this._stage.height / 2; }

  constructor(stage: Stage) {
    this._stage = stage;

    this.x = stage.width / 2;
    this.y = stage.height / 2;
  }
}