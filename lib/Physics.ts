interface Physics {
  solid: boolean;
  immovable: boolean;
  effectiveWidth?: number;
  effectiveHeight?: number;
}

class Ray {
  x0: number;
  y0: number;
  x1: number;
  y1: number;

  public get start(): Point { return new Point(this.x0, this.y0); }

  public get end(): Point { return new Point(this.x1, this.y1); }

  constructor(x0: number, y0: number, x1: number, y1: number) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }

  public static FromPoints(start: Point, end: Point): Ray {
    return new Ray(start.x, start.y, end.x, end.y);
  }
}

interface ResolveVelocityResult {
  newPosition: number;
  collision: boolean;
  collidedWith: MagicArray<Sprite>;
}

class PhysicsManager {
  private _sprites = new MagicArray<Sprite>();

  private static SKIN_WIDTH = 1;
  private static NUM_RAYS = 3;

  constructor() {
    
  }

  private moveSpriteX(sprite: Sprite, dx: number): ResolveVelocityResult {
    const SW = PhysicsManager.SKIN_WIDTH;

    const spriteSideX = sprite.x + (dx > 0 ? sprite.width: 0);
    const rayStartX   = spriteSideX + (dx > 0 ? -SW : SW);
    const rayEndX     = rayStartX + (dx > 0 ? SW : -SW) + dx;
    const raySpacing  = (sprite.height - SW * 2)/ (PhysicsManager.NUM_RAYS - 1)

    let result: ResolveVelocityResult = {
      newPosition  : sprite.x + dx,
      collision    : false,
      collidedWith : new MagicArray<Sprite>()
    }
    let closestCollisionDistance: number = Number.POSITIVE_INFINITY;

    for (let i = 0; i < PhysicsManager.NUM_RAYS; i++) {
      let y = sprite.y + SW + raySpacing * i;
      const ray = new Ray(rayStartX, y, rayEndX, y);

      this.raycast(ray, sprite.physics.collidesWith).then(hit => {
        const dist = spriteSideX - hit.position.x;

        if (!result.collision || dist < closestCollisionDistance) {
          closestCollisionDistance = dist;
          result = {
            collision: true,
            newPosition: hit.position.x - (dx > 0 ? sprite.width : 0),
            collidedWith: new MagicArray(hit.sprite)
          };
        }
      });
    }

    return result;
  }

  private moveSpriteY(sprite: Sprite, dy: number): ResolveVelocityResult {
    const SW = PhysicsManager.SKIN_WIDTH;

    const spriteSideY = sprite.y + (dy > 0 ? sprite.height : 0);
    const rayStartY   = spriteSideY + (dy > 0 ? -SW : SW);
    const rayEndY     = rayStartY + SW + dy;
    const raySpacing  = (sprite.width - SW * 2) / (PhysicsManager.NUM_RAYS - 1)

    let result: ResolveVelocityResult = {
      newPosition: sprite.y + dy,
      collision: false,
      collidedWith: new MagicArray<Sprite>()
    }
    let closestCollisionDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < PhysicsManager.NUM_RAYS; i++) {
      let x = sprite.x + SW + raySpacing * i;
      const ray = new Ray(x, rayStartY, x, rayEndY);

      this.raycast(ray, sprite.physics.collidesWith).then(hit => {
        const dist = spriteSideY - hit.position.y;

        if (!result.collision || dist < closestCollisionDistance) {
          closestCollisionDistance = dist;
          result = {
            collision: true,
            newPosition: hit.position.y - (dy > 0 ? sprite.height : 0),
            collidedWith: new MagicArray(hit.sprite)
          };
        }
      });
    }

    return result;
  }

  private moveSprite(sprite: Sprite, dx: number, dy: number): void {
    if (dx != 0) {
      const result = this.moveSpriteX(sprite, dx);

      sprite.x = result.newPosition;

      if (result.collision) {
        sprite.physics.touchingLeft  = dx < 0;
        sprite.physics.touchingRight = dx > 0;

        sprite.physics.collidedWith.addAll(result.collidedWith)
      }
    }

    if (dy != 0) {
      const result = this.moveSpriteY(sprite, dy);

      sprite.y = result.newPosition;

      if (result.collision) {
        sprite.physics.touchingTop    = dy < 0;
        sprite.physics.touchingBottom = dy > 0;

        sprite.physics.collidedWith.addAll(result.collidedWith)
      }
    }
  }

  update(): void {
    // move all sprites

    for (const sprite of this._sprites) {
      sprite.physics.resetFlags();
    }

    for (const sprite of this._sprites) {
      this.moveSprite(sprite, sprite.physics.dx, sprite.physics.dy);
    }

    for (const sprite of this._sprites) {
      sprite.physics.reset();
    }
  }

  add(sprite: Sprite): void {
    this._sprites.push(sprite);
  }

  remove(sprite: Sprite): void {
    const index = this._sprites.indexOf(sprite);

    if (index !== -1) {
      this._sprites.splice(index, 1);
    }
  }

  /**
   * Raycasts from a given ray, returning the first sprite that the ray intersects.
   * Ignores any sprite that the start of the ray is already colliding with.
   * 
   * @param ray 
   * @returns {} 
   */
  raycast(ray: Ray, against: Group<Sprite>): Maybe<RaycastResult> {
    // TODO could (should) use a quadtree or something

    if (!against) return new Maybe<RaycastResult>();

    const againstList = against.all();
    let result: RaycastResult = undefined;

    // TODO: could update var in a later version of TS.
    for (var sprite of againstList) { 
      if (Util.RectPointIntersection(sprite.globalBounds, ray.start)) {
        // The ray started in this sprite; disregard
        continue;
      }

      Util.RayRectIntersection(ray, sprite.globalBounds).then(position => {
        if (result === undefined ||
            ray.start.distance(position) < ray.start.distance(result.position)) {

          result = {
            position,
            sprite
          };
        }
      });
    }

    return new Maybe(result);
  }
}

interface RaycastResult {
  /**
   * The sprite that you hit.
   */
  sprite: Sprite;

  /**
   * The position of the collision.
   */
  position: Point;
}

class PhysicsComponent extends Component<Sprite> {
  public dx: number = 0;
  public dy: number = 0;

  public touchingBottom : boolean = false;
  public touchingTop    : boolean = false;
  public touchingRight  : boolean = false;
  public touchingLeft   : boolean = false;

  public solid    : boolean;
  public immovable: boolean;

  /**
   * Width of this object in the physics engine. Defaults to sprite.width.
   */
  public effectiveWidth: number;

  /**
   * Height of this object in the physics engine. Defaults to sprite.height.
   */
  public effectiveHeight: number;

  /**
   * The things that this object can actually hit.
   */
  public collidesWith : Group<Sprite>;

  /**
   * The things that this object just hit this frame.
   */
  public collidedWith : MagicArray<Sprite>;

  constructor(physics: Physics) {
    super();

    this.solid        = physics.solid;
    this.immovable    = physics.immovable;

    this.effectiveWidth = physics.effectiveWidth;
    this.effectiveHeight = physics.effectiveHeight;
  }

  init(sprite: Sprite): void {
    super.init(sprite);

    this.effectiveHeight = this.effectiveHeight || sprite.height;
    this.effectiveWidth  = this.effectiveWidth  || sprite.width;

    Globals.physicsManager.add(sprite)
  }

  moveBy(dx: number, dy: number): void {
    this.dx += dx;
    this.dy += dy;
  }

  /**
   * Resets any physics changes the attached Sprite would have received on this turn.
   * Called right after a physics update.
   */
  reset(): void {
    this.dx = 0;
    this.dy = 0;
  }

  /**
   * Called right before a physics update.
   */
  resetFlags(): void {
    this.touchingBottom = false;
    this.touchingTop    = false;
    this.touchingLeft   = false;
    this.touchingRight  = false;

    this.collidedWith = new MagicArray<Sprite>();
  }

  postUpdate(): void { }
  preUpdate() : void { }
  update()    : void { }
  
  destroy(): void {
    Globals.physicsManager.remove(this._sprite);
  }
}