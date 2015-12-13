class Camera {
  private _stage: Stage;

  private _x: number;
  private _y: number;

  public get x(): number { return this._x; }
  public set x(value: number) {
    this.moveTo(value, this._y);

    this.hasXYChanged = true;
  }

  public get y(): number { return this._y; }
  public set y(value: number) {
    this.moveTo(this._x, value);

    this.hasXYChanged = true;
  }

  public get top(): number { return this._x - this._stage.width / 2; }

  public get left(): number { return this._y - this._stage.height / 2; }

  private moveTo(x: number, y: number): void {
    this._x = Math.round(x);
    this._y = Math.round(y);

    this._stage.x = this._stage.width / 2  - this._x;
    this._stage.y = this._stage.height / 2 - this._y;
  }

  // screen shake state

  static SHAKE_AMT: number = 3;
  shakingDuration: number = 0;
  isShaking: boolean = false;

  hasXYChanged: boolean = false;
  initialX: number;
  initialY: number;

  constructor(stage: Stage) {
    this._stage = stage;

    this.x = stage.width / 2;
    this.y = stage.height / 2;
  }

  private stopShaking(): void {
    if (!this.hasXYChanged) {
      this.x = this.initialX;
      this.y = this.initialY;
    }

    this.isShaking = false;
  }

  private shake(): void {
    this.shakingDuration--;

    if (this.shakingDuration < 0) {
      this.stopShaking();
      return;
    }

    // The problem here is that sometimes the camera is static, which means 
    // we have to remember its coordinates (so we can set it back later) and sometimes
    // it's not, so we have to be sure *not* to set it back later.

    // The only way that hasXYChanged gets set is when someone with follow logic
    // sets it outside of Camera, so we listen for that to determine what to do.

    // TODO: I think the camera should have the following logic now, rather than
    // a sprite. I mean, when are you ever going to follow 2 sprites anyways -_-

    if (this.hasXYChanged) {
      this.moveTo(Util.RandomRange(-Camera.SHAKE_AMT, Camera.SHAKE_AMT),
                  Util.RandomRange(-Camera.SHAKE_AMT, Camera.SHAKE_AMT));
    } else {
      this.moveTo(this.initialX + Util.RandomRange(-Camera.SHAKE_AMT, Camera.SHAKE_AMT),
                  this.initialY + Util.RandomRange(-Camera.SHAKE_AMT, Camera.SHAKE_AMT));
    }
  }

  public shakeScreen(duration: number = 10): void {
    this.shakingDuration = duration;

    this.isShaking = true;
    this.hasXYChanged = false;
    this.initialX = this.x;
    this.initialY = this.y;
  }

  update(): void {
    if (this.isShaking) {
      this.shake();
    }
  }
}