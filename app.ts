/// <reference path="lib/lib.d.ts"/>

// TODO: parse map json (better than phaser -_-)

class G {
  static player: Player;
  static map: TiledMapParser;
}

// @component(new FollowWithCamera())
@component(new PhysicsComponent({
  solid: true,
  immovable: true,
  effectiveWidth: 31,
  effectiveHeight: 31
}))
class Player extends Sprite {
  vy: number = 0;

  // Jump state

  isJumping: boolean = false;
  jumpHeight: number = 11;
  maxVy: number      = 10;
  gravity: number    = .5;

  constructor() {
    super("assets/ship.png");

    this.z = 10;
    this.y = 300;

    this.physics.collidesWith = new Group(G.map.getLayer("Wall").children);
  }

  update(): void {
    if (Globals.keyboard.down.A) {
      this.physics.moveBy(-5, 0);
    }

    if (Globals.keyboard.down.D) {
      this.physics.moveBy(5, 0);
    }

    if (!this.isJumping) {
      if (Globals.keyboard.down.Spacebar) {
        this.vy = -this.jumpHeight;
        this.isJumping = true;
      }
    } else {
      if (!Globals.keyboard.down.Spacebar && this.vy < 0) {
        this.vy = 0;
      }

      // lose velocity when hitting ceiling
      if (this.physics.touchingTop && this.vy < 0) {
        this.vy = 0;
      }
    }

    this.vy += this.gravity;

    if (this.vy > this.maxVy) {
      this.vy = this.maxVy;
    }

    if (this.physics.touchingBottom) {
      this.isJumping = false;
      this.vy = 0;
    }

    this.physics.moveBy(0, this.vy);
  }

  postUpdate(): void {
  }
}

class MovingComponent extends Component<Sprite> {
  postUpdate(): void { }
  preUpdate() : void { }
  update(): void {
    this._sprite.physics.moveBy(0, -5);
  }
}

class MyGame extends Game {
  constructor() {
    super(600, 400, document.getElementById("main"), true);

    G.map = new TiledMapParser("assets/map.json");
  }

  loadingComplete(): void {
    console.log("Yay, loading complete");

    G.player = new Player();

    Globals.stage.addChild(G.player);

    G.map.z = -10;

    Globals.stage.addChild(G.map);

    new FPSCounter();

    super.loadingComplete();
  }
}

Util.RunOnStart(() => {
  Debug.DEBUG_MODE = false;

  new MyGame();
});
