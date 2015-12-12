/// <reference path="lib/lib.d.ts"/>

// TODO: parse map json (better than phaser -_-)

class G {
  static player: Player;
  static map: TiledMapParser;
  static hud: HUD;
}

// @component(new FollowWithCamera())
@component(new PhysicsComponent({
  solid: true,
  immovable: true
}))
class Player extends Sprite {
  private _health: number = 10;
  public get health(): number { return this._health;  }

  private _maxHealth: number = 10;
  public get maxHealth(): number { return this._maxHealth;  }

  private vy: number = 0;

  // Jump state

  private isJumping: boolean = false;
  private jumpHeight: number = 11;
  private maxVy: number      = 10;
  private gravity: number    = .5;

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

@component(new FixedToCamera(0, 0))
class HUD extends Sprite {
  private _barWidth: number = 100;
  private _barHeight: number = 15;

  private _healthbarRed: Sprite;
  private _healthbarGreen: Sprite;
  private _healthbarText: TextField;

  constructor() {
    super();

    this.z = 20;

    this.createHealthbar();
  }

  createHealthbar(): void {
    this._healthbarRed = new Sprite("assets/healthbar_red.png")
      .moveTo(10, 10)
      .setZ(4)
      .setDimensions(this._barWidth, this._barHeight)
      .addTo(this);

    this._healthbarGreen = new Sprite("assets/healthbar_green.png")
      .moveTo(10, 10)
      .setZ(5)
      .setDimensions(this._barWidth, this._barHeight)
      .addTo(this);

    this._healthbarText = new TextField("10/10")
      .setDefaultTextStyle({ font: "12px Verdana", fill: "white" })
      .moveTo(12, 10)
      .setZ(6)
      .addTo(this);
  }

  update(): void {
    
  }
}

enum BasicEnemyState {
  MovingLeft,
  MovingRight,
}

@component(new PhysicsComponent({
  solid: true,
  immovable: true
}))
class Enemy extends Sprite {
  state: BasicEnemyState;
  speed: number = 3;

  constructor(texture: PIXI.Texture, x: number, y: number) {
    super(texture);

    this.state = BasicEnemyState.MovingLeft;
    this.moveTo(x, y);

    Globals.events.on(GlobalEvents.LoadingIsDone, () => {
      this.physics.collidesWith = new Group(G.map.getLayer("Wall").children);
    });
  }

  update(): void {
    switch (this.state) {
      case BasicEnemyState.MovingLeft:
        if (this.physics.touchingLeft) {
          this.state = BasicEnemyState.MovingRight;
        } else {
          this.physics.moveBy(-this.speed, 0);
        }
        break;

      case BasicEnemyState.MovingRight:
        if (this.physics.touchingRight) {
          this.state = BasicEnemyState.MovingLeft;
        } else {
          this.physics.moveBy(this.speed, 0);
        }
        break;
    }
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

    G.map = new TiledMapParser("assets/map.json")
      .addLayerParser("Enemies", (text, x, y) => new Enemy(text, x, y))
      .parse();
  }

  loadingComplete(): void {
    console.log("Yay, loading complete");

    G.player = new Player();

    G.hud = new HUD();
    Globals.stage.addChild(G.hud);

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
