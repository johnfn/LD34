/// <reference path="Sprite.ts"/>

/* I am unsure what goes in here. */
interface ITiledProperties { }

interface TiledTilesetJSON {
  firstgid: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  properties: ITiledProperties;
  spacing: number;
  tilecount: number;
  tileheight: number;
  tilewidth: number;
}

interface TiledMapJSON {
  height: number;
  nextobjectid: number;
  orientation: string;
  renderorder: string;
  tileheight: number;
  tilewidth: number;
  version: number;
  width: number;

  properties: ITiledProperties;
  tilesets: TiledTilesetJSON[];
  layers: TiledMapLayerJSON[];
}

interface TiledMapLayerJSON {
  data: number[];
  height: number;
  name: string;
  opacity: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number
}

interface Tileset {
  texture: PIXI.Texture;
  firstGID: number;
  lastGID: number;
  tileWidth: number;
  tileHeight: number;
  widthInTiles: number;
}

interface LayerProcess {
  (texture: PIXI.Texture, x: number, y: number): Sprite;
}

class TiledMapParser extends Sprite {
  private _rootPath: string;
  private _layers: { [key: string]: Sprite; } = {};
  private _path: string;
  private _layerProcessing: { [key: string]: LayerProcess } = {};

  constructor(path: string) {
    super();

    this._path = path;
  }

  /**
   * TODO: better name
   * TODO: per-tile properties, perhaps?
   * 
   * Add custom function to process layer.
   * 
   * @param layerName
   * @param process
   */
  public addLayerParser(layerName: string, process: LayerProcess): this {
    this._layerProcessing[layerName] = process;

    return this;
  }

  /**
   * Actually create the tilemap. 
   * 
   * (Note: is an asynchronous process as we need to load the json. Be sure to call this
   * in Game#constructor.)
   */
  public parse(): this {
    this._rootPath = this._path.slice(0, this._path.lastIndexOf("/") + 1);

    let request = new XMLHttpRequest();
    request.open('GET', this._path + "?" + Math.random(), true); // Cachebust the path to the map.
    Globals.thingsThatAreLoading++;

    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        let data = JSON.parse(request.responseText);

        this.process(data);
      } else {
        this.error("Error retrieving map.");
      }

      Globals.thingsThatAreLoading--;
    };

    request.onerror = () => {
      this.error("Error retrieving map.");
    };

    request.send();
    
    return this;
  }

  public getLayer(name: string): Sprite {
    if (name in this._layers) {
      return this._layers[name];
    } else {
      console.error(`layer named ${name} not found.`);
    }
  }

  private error(msg: string) {
    console.error(msg);
  }

  private process(json: TiledMapJSON) {
    let tilesets = new MagicArray<Tileset>();

    let tilesetsJSON = new MagicArray<TiledTilesetJSON>(json.tilesets)
      .sortByKey(o => o.firstgid);

    for (var i = 0; i < tilesetsJSON.length; i++) {
      let currentTileset = tilesetsJSON[i];
      let nextTileset = tilesetsJSON[i + 1];

      let textureUrl = this._rootPath + currentTileset.image;
      let texture = PIXI.Texture.fromImage(textureUrl);

      tilesets.push({
        texture: texture,
        tileWidth: currentTileset.tilewidth,
        tileHeight: currentTileset.tileheight,
        firstGID: currentTileset.firstgid,
        lastGID: i === tilesetsJSON.length - 1 ? Number.POSITIVE_INFINITY : nextTileset.firstgid,
        widthInTiles: currentTileset.imagewidth / currentTileset.tilewidth
      });
    }

    this._layers = {};

    for (let layerJSON of json.layers) {
      let layer = new Sprite();

      layer.baseName = layerJSON.name;

      for (let i = 0; i < layerJSON.data.length; i++) {
        // Find the spritesheet that contains the tile id.

        var value = layerJSON.data[i];
        if (value == 0) continue;

        let spritesheet = tilesets.find(o => o.firstGID <= value && o.lastGID > value);

        value -= spritesheet.firstGID;

        let tileSourceX = (value % spritesheet.widthInTiles) * spritesheet.tileWidth;
        let tileSourceY = Math.floor(value / spritesheet.widthInTiles) * spritesheet.tileHeight;

        let destX = (i % layerJSON.width) * spritesheet.tileWidth;
        let destY = Math.floor(i / layerJSON.width) * spritesheet.tileHeight;

        let crop = new PIXI.Rectangle(tileSourceX, tileSourceY, spritesheet.tileWidth, spritesheet.tileHeight);

        // TODO - cache these textures.
        let texture = new PIXI.Texture(spritesheet.texture, crop);
        let tile: Sprite;

        // Do we have special layer processing logic?
        if (this._layerProcessing[layerJSON.name]) {
          tile = this._layerProcessing[layerJSON.name](texture, destX, destY);
        } else {
          tile = new Sprite(texture);

          tile.x = destX;
          tile.y = destY;
        }

        layer.addChild(tile);
      }

      this.addChild(layer);

      this._layers[layerJSON.name] = layer;
    }
  }
}

