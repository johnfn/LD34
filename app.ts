/// <reference path="lib/lib.d.ts"/>

// TODO: parse map json (better than phaser -_-)

class G {
  static player: Player;
  static map: TiledMapParser;
  static hud: HUD;

  static get walls(): Group<Sprite> {
    return new Group(G.map.getLayer("Wall").children);
  }
}

interface HasHealth {
  healthEvents: Events<HealthEvents>;
}

enum HealthEvents {
  /**
   * args: previous health, new health
   */
  ChangeHealth
}

// @component(new FollowWithCamera())
@component(new PhysicsComponent({
  solid: true,
  immovable: true
}))
class Player extends Sprite implements HasHealth {
  private _health: number = 10;
  public get health(): number { return this._health;  }
  public set health(val: number) { throw new Error("Don't set health!"); }

  private _maxHealth: number = 10;
  public get maxHealth(): number { return this._maxHealth;  }

  private vy: number = 0;

  public healthEvents: Events<HealthEvents>;

  /**
   * Facing left or right
   */
  private facing: number = 1;

  private facingUp: Boolean = false;

  // Jump state

  private isJumping: boolean = false;
  private jumpHeight: number = 11;
  private maxVy: number      = 10;
  private gravity: number    = .5;

  // Flicker state

  private MAX_FLICKER_DURATION: number = 90;
  private isFlickering: boolean = false;
  private flickerTime: number   = 0;

  // Shooting state

  private SHOOTING_COOLDOWN   = 12;
  private BULLET_SPEED        = 8;
  private ticksTillNextBullet = 0;

  constructor() {
    super("assets/ship.png");

    this.z = 10;
    this.y = 300;

    this.healthEvents = new Events<HealthEvents>();

    this.physics.collidesWith = new Group(G.map.getLayer("Wall").children);
  }

  private takeDamage(amount: number): void {
    this._health -= amount;

    this.startFlicker();

    Globals.camera.shakeScreen();

    this.healthEvents.emit(HealthEvents.ChangeHealth, this._health + amount, this._health);
  }

  private checkForDamage(): void {
    const collidedEnemies = this.physics.touches(Sprites.all(Enemy));

    if (collidedEnemies.length > 0) {
      for (const enemy of collidedEnemies) {
        this.takeDamage(enemy.damage);

        this.physics.touches(Sprites.all(Enemy));
      }
    }
  }

  private startFlicker(): void {
    this.isFlickering = true;
    this.flickerTime = this.MAX_FLICKER_DURATION;
  }

  private finishFlicker(): void {
    this.isFlickering = false;
    this.alpha = 1.0
  }

  private processFlicker(): void {
    this.flickerTime--;

    if (this.flickerTime < 0) {
      this.finishFlicker();
      return;
    }

    let transparent = false;

    if (this.flickerTime > this.MAX_FLICKER_DURATION / 2) {
      // first half
      transparent = Math.floor(this.flickerTime / 5) % 2 == 0;
    } else {
      // second half (faster!)
      transparent = Math.floor(this.flickerTime / 3) % 2 == 0;
    }

    this.alpha = transparent ? 0.5 : 1.0;
  }

  shoot(): void {
    if (this.ticksTillNextBullet < 0) {
      const bullet = new Bullet(this.facing, this.facingUp ? -1 : 0, this.BULLET_SPEED);

      bullet.x = this.x;
      bullet.y = this.y;

      Globals.stage.addChild(bullet);

      this.ticksTillNextBullet = this.SHOOTING_COOLDOWN;
    }
  }

  private testing: boolean = true;

  update(): void {
    super.update();

    if (!this.isFlickering) {
      this.checkForDamage();
    } else {
      this.processFlicker();
    }

    if (this.testing) {
      this.testing = false;

      for (let i = 0; i < 100; i++) {
        const bullet = new Bullet(1, 0, this.BULLET_SPEED);

        bullet.x = this.x;
        bullet.y = this.y;

        Globals.stage.addChild(bullet);  
      }
    }

    if (Globals.keyboard.down.Left) {
      this.facing = -1;
      this.physics.moveBy(-5, 0);
    }

    if (Globals.keyboard.down.Right) {
      this.facing = 1;
      this.physics.moveBy(5, 0);
    }

    this.facingUp = Globals.keyboard.down.Up;

    if (Globals.keyboard.down.Z) {
      this.shoot();
    }

    this.ticksTillNextBullet--;

    if (!this.isJumping) {
      if (Globals.keyboard.down.X) {
        this.vy = -this.jumpHeight;
        this.isJumping = true;
      }
    } else {
      if (!Globals.keyboard.down.X && this.vy < 0) {
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

@component(new PhysicsComponent({
  solid: true,
  immovable: true
}))
class Bullet extends Sprite {
  vx: number;
  vy: number;

  constructor(signX: number, signY: number, speed: number) {
    super("assets/bullet.png");

    this.vx = signX * speed;
    this.vy = signY * speed;
  }

  update(): void {
    super.update();

    this.physics.collidesWith = Sprites.by(x => x instanceof Enemy || x.tags.indexOf("Wall") != -1)

    this.physics.moveBy(this.vx, this.vy)
  }
}

class HealthBar extends Sprite {
  private _barWidth: number = 100;
  private _barHeight: number = 15;

  private _healthbarRed: Sprite;
  private _healthbarGreen: Sprite;
  private _healthbarText: TextField;

  private _showText: boolean = false;

  constructor(target: HasHealth, width: number = 100, height: number = 15, showText: boolean = false) {
    super();

    this._showText = showText;
    this._barWidth = width;
    this._barHeight = height;

    this.createHealthbar();

    target.healthEvents.on(HealthEvents.ChangeHealth, (prevHealth: number, currentHealth: number) => {
      this.tween.addTween("animate-healthbar", 60, (e: Tween) => {
        this.animateHealthbar(e, prevHealth, currentHealth);
      })
    });
  }

  animateHealthbar(e: Tween, prevHealth: number, currentHealth: number): void {
    const prevWidth: number = (prevHealth / G.player.maxHealth) * this._barWidth;
    const nextWidth: number = (currentHealth / G.player.maxHealth) * this._barWidth;

    this._healthbarGreen.width = Util.Lerp(prevWidth, nextWidth, e.percentage);
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

    if (this._showText) {
      this._healthbarText = new TextField("10/10")
        .setDefaultTextStyle({ font: "12px Verdana", fill: "white" })
        .moveTo(12, 10)
        .setZ(6)
        .addTo(this);
    }
  }

  update(): void {
    super.update();

    if (this._showText) {
      this._healthbarText.text = `${G.player.health}/${G.player.maxHealth}`;
    }
  }
}

@component(new FixedToCamera(0, 0))
class HUD extends Sprite {
  private _healthBar: HealthBar;

  constructor() {
    super();

    this.z = 20;
    this._healthBar = new HealthBar(G.player, 100, 15, true);
    this.addChild(this._healthBar);
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
  speed: number  = 3;

  private _damage: number = 2;
  public get damage(): number { return this._damage; }

  constructor(texture: PIXI.Texture, x: number, y: number) {
    super(texture);

    this.state = BasicEnemyState.MovingLeft;
    this.moveTo(x, y);

    Globals.events.on(GlobalEvents.LoadingIsDone, () => {
      this.physics.collidesWith = new Group(G.map.getLayer("Wall").children);
    });
  }

  update(): void {
    super.update();

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
    super(600, 400, document.getElementById("main"), 0x000000, true);

    G.map = new TiledMapParser("assets/map.json")
      .addLayerParser("Enemies", (text, x, y) => new Enemy(text, x, y))
      .parse();
  }

  loadingComplete(): void {
    G.player = new Player();

    Globals.camera.x = Globals.stage.width / 2;
    Globals.camera.y = Globals.stage.height / 2;

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
