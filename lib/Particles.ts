class Particle extends PIXI.Sprite {
  constructor(t: PIXI.Texture) {
    super(t);
  }
}

class Particles extends Sprite {
  private _mainTexture: PIXI.Texture;

  /**
   * Texture of every particle we can create.
   */
  private _textures: PIXI.Texture[];

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

    for (let i = 0; i < textureWidth; i += particleWidth) {
      const crop = new PIXI.Rectangle(i, 0, particleWidth, particleHeight);

      console.log(crop);

      this._textures.push(new PIXI.Texture(this._mainTexture, crop));
    }
  }

  addParticle() {
    for (let i = 0; i < this._textures.length; i++) {
      const rp = new Particle(this._textures[i]);

      this.addDO(rp);

      rp.x = i * 32;
      rp.y = 0;
    }
  }
}