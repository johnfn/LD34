class Particle extends PIXI.Sprite {
}

interface RecycledObject<T> {
  object: T;
  created: number;
  alive: boolean;
}

/**
 * Object recycling.
 */
class Recycler<T> {
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
   * Flag an item as ready to be recycled.
   * 
   * @param o
   */
  remove(o: T): void {
    for (let i = 0; i < this._bin.length; i++) {
      if (this._bin[i].object === o) {
        this._bin[i].alive = false;
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
        // Recycle!
        this._onRecycle(oldest.object);
        result = oldest.object;
      }

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
        const p = new Particle();
        this.addDO(p);

        return p;
      },
      onRecycle: (p: Particle) => {
        p.texture = Util.RandomElement(this._textures);
      }
    });

    for (let i = 0; i < textureWidth; i += particleWidth) {
      const crop = new PIXI.Rectangle(i, 0, particleWidth, particleHeight);

      this._textures.push(new PIXI.Texture(this._mainTexture, crop));
    }
  }

  addParticle() {
    for (let i = 0; i < 200; i++) {
      const p = this._recycler.get();

      p.x = Util.RandomRange(0, 300);
      p.y = Util.RandomRange(0, 300);
    }
  }
}