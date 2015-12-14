interface CameraLayer {
  parallaxAmount: number;
  contents: Sprite;
}


/**
 * A quick note about coordinate systems. Every layer with a different parallax scroll
 * amount has a different coordinate system associated with it. 
 * 
 * We call "world space" the coordinate system associated with a parallax amount of 1.
 * 
 * We call "screen space" the coordinate system associated with a parallax amount of 0.
 * 
 * This function takes points in world space and converts them to any other
 * coordinate system that you could possibly desire.
 */

/**
 * Camera class. Effects what we can see.
 */
class Camera {
  private _layers: CameraLayer[] = [];

  /**
   * x coordinate of the center of the camera in world space.
   */
  private _x: number;

  /**
   * y coordinate of the center of the camera in world space.
   */
  private _y: number;

  private _gameWidth: number;
  private _gameHeight: number;

  /**
   * The x position of the center of the camera.
   */
  public get x(): number { return this._x; }
  public set x(value: number) {
    this.moveTo(value, this._y);

    this.hasXYChanged = true;
  }

  /**
   * The y position of the center of the camera.
   */
  public get y(): number { return this._y; }
  public set y(value: number) {
    this.moveTo(this._x, value);

    this.hasXYChanged = true;
  }

  // Screen shake state (TODO - should be separated out)

  static SHAKE_AMT: number = 3;
  shakingDuration: number = 0;
  isShaking: boolean = false;

  hasXYChanged: boolean = false;
  initialX: number;
  initialY: number;

  constructor(stage: Stage) {
    this._gameWidth = stage.width;
    this._gameHeight = stage.height;
  }

  /**
   * Get the top left coordinate of the camera, optionally not in world space
   * if you pass in a different argument for parallax.
   * @param parallax
   */
  public topLeft(parallax: number = 1): Point {
    return new Point(
      (this._x - this._gameWidth / 2) * parallax,
      (this._y - this._gameHeight / 2) * parallax
    );
  }

  /**
   * Get the bottom right coordinate of the camera, optionally not in world space
   * if you pass in a different argument for parallax.
   * @param parallax
   */
  public bottomRight(parallax: number = 1): Point {
    return new Point(
      (this._x - this._gameWidth / 2) * parallax + this._gameWidth,
      (this._y - this._gameHeight / 2) * parallax + this._gameHeight
    );
  }

  private moveTo(x: number, y: number): void {
    // Round to avoid artifacts

    this._x = Math.round(x);
    this._y = Math.round(y);

    for (const layer of this._layers) {
      layer.contents.x = layer.contents.width / 2 - (this._x * layer.parallaxAmount);
      layer.contents.y = layer.contents.height / 2 - (this._y * layer.parallaxAmount);
    }
  }

  /**
   * Add a layer to the camera.
   * 
   * parallaxAmount of 1 is the behavior you'd expect from a camera. The object is 
   * only visible so long as it is within the frame of the camera.
   * 
   * parallaxAmount of 0 means the layer stays fixed on the camera. Useful for HUD stuff which
   * is fixed on the screen.
   * 
   * parallaxAmount is otherwise interpolated. A parallaxAmount of 0.2 is handy for e.g 
   * parallaxed backgrounds.
   * 
   * @param layer
   * @param parallaxAmount
   */
  addParallaxLayer(contents: Sprite, parallaxAmount: number = 1) {
    Globals.fixedStage.addChild(contents);

    this._layers.push({
      contents,
      parallaxAmount
    });
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