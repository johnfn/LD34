interface ParticleBehavior {
  /**
   * x speed of the particle.
   */
  dx: number;

  /**
   * y speed of the particle.
   */
  dy: number;

  /**
   * Rotation speed of the particle (in radians).
   */
  rotation: number;

  scale: number;

  /**
   * Do the particles obey the laws of gravity?
   * 
   * Defaults to false.
   */
  gravity?: boolean;

  /**
   * Number of ticks this particle will stay alive.
   */
  lifetime: number;
}

enum ParticleEvents {
  Died
}

class Particle extends PIXI.Sprite {
  public particleEvents: Events<ParticleEvents>;
  
  private _behavior: ParticleBehavior;
  private _ticksLeft: number;
  private _effectiveDy: number;

  constructor(width: number, height: number) {
    super();

    this.pivot = new PIXI.Point(width / 2, height / 2);
    this.particleEvents = new Events<ParticleEvents>();
  }

  setBehavior(behavior: ParticleBehavior) {
    this._behavior    = behavior;
    this._ticksLeft   = behavior.lifetime;
    this._effectiveDy = behavior.dy;

    // scale does not change, so set it once. also bc i dont like making tons of points
    this.scale = new Point(this._behavior.scale, this._behavior.scale);
  }

  /**
   * Update a particle based on its ParticleBehavior. 
   */
  update(): void {
    this.x += this._behavior.dx;
    this.y += this._effectiveDy;

    if (this._behavior.gravity) {
      this._effectiveDy += 1;
    }

    this.rotation += this._behavior.rotation;

    this.alpha = Util.AntiLerp(0, this._behavior.lifetime, this._ticksLeft);

    if (this._ticksLeft-- < 0) {
      this.particleEvents.emit(ParticleEvents.Died);
    }
  }
}

interface RecycledObject<T> {
  object: T;
  created: number;
  alive: boolean;
}

/**
 * Object recycling.
 * 
 * Haha wow I totally guessed that extends syntax and got it I'm awesome
 */
class Recycler<T extends { visible: boolean }> {
  private _bin: RecycledObject<T>[] = [];
  private _maxSize: number;
  private _onCreate: () => T;
  private _onRecycle: (item: T) => void;

  constructor(maxSize: number, events: {
    onCreate: () => T,
    onRecycle: (item: T) => void }) {

    this._onCreate    = events.onCreate;
    this._onRecycle   = events.onRecycle;
    this._maxSize     = maxSize;
  }

  /**
   * Get all alive items.
   */
  items(): T[] {
    const result: T[] = [];

    for (let i = 0; i < this._bin.length; i++) {
      const item = this._bin[i];
      if (item.alive) {
        result.push(item.object);
      }
    }

    return result;
  }

  /**
   * Flag an item as ready to be recycled.
   * 
   * @param o
   */
  remove(o: T): void {
    for (let i = 0; i < this._bin.length; i++) {
      const item = this._bin[i];

      if (item.object === o) {
        item.object.visible = true;
        item.alive = false;
      }
    }
  }

  /**
   * Get an item from the recycling bin, (possibly evicting one that already exists).
   */
  get(): T {
    if (this._bin.length < this._maxSize) {
      const entry = {
        object: this._onCreate(),
        alive: true,
        created: +new Date
      };

      this._onRecycle(entry.object);

      this._bin.push(entry);

      return entry.object;
    } else {
      let result: T;
      let oldest: RecycledObject<T>;

      for (let i = 0; i < this._bin.length; i++) {
        const item = this._bin[i];

        if (!item.alive) {
          item.alive = true;
          result = item.object;

          break;
        } else {
          if (!oldest || oldest.created > item.created) {
            oldest = item;
          }
        }
      }

      if (!result) {
        result = oldest.object;
      }

      // Recycle!
      this._onRecycle(result);

      result.visible = true;

      return result;
    }
  }
}

class Particles extends Sprite {
  private _mainTexture: PIXI.Texture;

  /**
   * Texture of every particle we can create.
   */
  private _textures: PIXI.Texture[];

  private _recycler: Recycler<Particle>;

  /**
   * Takes a particle spritesheet (TODO should make spritesheets, heh)
   * 
   * Pass in w/h of individual particle on spritesheet
   *
   * Expected to be a single strip
   * @param path
   * @param width
   * @param height
   */
  constructor(path: string, particleWidth: number, particleHeight: number, textureWidth: number, textureHeight: number) {
    super();

    this.z = 100;
    this._mainTexture = PIXI.Texture.fromImage(path);
    this._textures = [];

    this._recycler = new Recycler(100, {
      onCreate: () => {
        const p = new Particle(particleWidth, particleHeight);

        this.addDO(p);
        p.particleEvents.on(ParticleEvents.Died, () => {
          this._recycler.remove(p);
        });

        return p;
      },
      onRecycle: (p: Particle) => {
        p.texture = Util.RandomElement(this._textures);
        p.setBehavior(this.particleBehavior());
      }
    });

    for (let i = 0; i < textureWidth; i += particleWidth) {
      const crop = new PIXI.Rectangle(i, 0, particleWidth, particleHeight);

      this._textures.push(new PIXI.Texture(this._mainTexture, crop));
    }
  }

  particleBehavior(): ParticleBehavior {
    throw new Error("This should be overridden...");
  }

  addParticle(): Particle {
    return this._recycler.get();
  }

  addParticles(num: number): Particle[] {
    const result: Particle[] = [];

    for (let i = 0; i < num; i++) {
      result.push(this.addParticle());
    }

    return result;
  }

  update(): void {
    super.update();

    const particles = this._recycler.items();

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
    }
  }
}

class ParticleExplosionMaker extends Particles {
  constructor(path: string, particleWidth: number, particleHeight: number, textureWidth: number, textureHeight: number) {
    super(path, particleWidth, particleHeight, textureWidth, textureHeight);
  }

  explodeAt(x: number, y: number): void {
    this.tween.addTween("explode", 10, (e: Tween) => {
      const p = this.addParticles(2);

      for (let i = 0; i < p.length; i++) {
        p[i].x = x;
        p[i].y = y;
      }
    });
  }

  particleBehavior(): ParticleBehavior {
    const pt = Util.RandomPointOnUnitCircle();

    return {
      lifetime: Util.RandomRange(5, 20),
      gravity: true,
      scale: 1,
      dx: pt.x * 4,
      dy: pt.y * 4,
      rotation: Util.RandomRange(-.5, .5)
    };
  }
}

class ParticleEmitter extends Particles {
  constructor(path: string, particleWidth: number, particleHeight: number, textureWidth: number, textureHeight: number) {
    super(path, particleWidth, particleHeight, textureWidth, textureHeight);
  }

  emitAt(x: number, y: number): void {
    const p = this.addParticles(1);

    for (let i = 0; i < p.length; i++) {
      p[i].x = x;
      p[i].y = y;
    }
  }

  /**
   * Emits particles from a random location inside the rectangle.
   * @param rect
   */
  emitIn(rect: PIXI.Rectangle): void {
    const p = this.addParticles(1);

    for (let i = 0; i < p.length; i++) {
      p[i].x = Util.RandomRange(rect.x, rect.x + rect.width);
      p[i].y = Util.RandomRange(rect.y, rect.y + rect.height);
    }
  }

  particleBehavior(): ParticleBehavior {
    return {
      lifetime: Util.RandomRange(60, 180),
      scale: Util.RandomRange(.5, 2),
      dx: Util.RandomRange(-.4, .4),
      dy: Util.RandomRange(-.4, -.7),
      rotation: Util.RandomRange(-.5, .5)
    };
  }
}