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
  layers: (TiledMapLayerJSON | TiledMapObjectLayerJSON)[];
}

interface TiledMapLayerJSON {
  data: number[];
  height: number;
  name: string;
  opacity: number;
  type: string; // "tilelayer"
  visible: boolean;
  width: number;
  x: number;
  y: number
}

interface TiledObjectJSON {
  gid: number;
  height: number;
  id: number;
  name: string;
  properties: { [key: string]: any }
  rotation: number;
  type: string;
  width: number;
  x: number;
  y: number;
}

interface TiledMapObjectLayerJSON {
  draworder: string;
  height: number;
  name: string;
  objects: TiledObjectJSON[]
  opacity: number;
  type: string; // "objectgroup"
  visible: boolean;
  width: number;
  x: number;
  y: number;
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

interface ObjectProcess {
  (texture: PIXI.Texture, json: TiledObjectJSON): Sprite;
}

class TiledMapParser extends Sprite {
  private _rootPath: string;
  private _tileLayers: { [key: string]: Sprite; } = {};
  private _objectLayers: { [key: string]: Sprite; } = {};
  private _path: string;
  private _layerProcessing: { [key: string]: LayerProcess } = {};
  private _objectProcessing: { [key: number]: ObjectProcess } = {};

  /**
   * Width of a tile (we are making an assumption that tiles across spreadsheets
   * have the same width!)
   */
  private _tileWidth: number;

  /**
   * Height of a tile (see width disclaimer)
   */
  private _tileHeight: number;

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
   * Add custom function to process object (by gid)
   * @param gid
   * @param process
   */
  public addObjectParser(gid: number, process: ObjectProcess): this {
    this._objectProcessing[gid] = process;

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

  public getTileLayer(name: string): Sprite {
    if (name in this._tileLayers) {
      return this._tileLayers[name];
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

      this._tileWidth = currentTileset.tilewidth;
      this._tileHeight = currentTileset.tileheight;
    }

    this._tileLayers = {};
    this._objectLayers = {};

    for (let layerJSON of json.layers) {
      if (layerJSON.type === "tilelayer") {
        const layer = this.parseTiledMapLayer(layerJSON as TiledMapLayerJSON, tilesets);

        this._tileLayers[layerJSON.name] = layer;
      } else {
        const layer = this.parseObjectLayer(layerJSON as TiledMapObjectLayerJSON, tilesets);

        this._objectLayers[layerJSON.name] = layer;
      }
    }
  }

  private gidToSomethingMoreUseful(gid: number, tilesets: MagicArray<Tileset>): PIXI.Texture {
    if (gid === 0) return null;

    let spritesheet = tilesets.find(o => o.firstGID <= gid && o.lastGID > gid);

    gid -= spritesheet.firstGID;

    let tileSourceX = (gid % spritesheet.widthInTiles) * spritesheet.tileWidth;
    let tileSourceY = Math.floor(gid / spritesheet.widthInTiles) * spritesheet.tileHeight;

    let crop = new PIXI.Rectangle(tileSourceX, tileSourceY, spritesheet.tileWidth, spritesheet.tileHeight);

    // TODO - cache these textures.
    return new PIXI.Texture(spritesheet.texture, crop);
  }

  private parseObjectLayer(layerJSON: TiledMapObjectLayerJSON, tilesets: MagicArray<Tileset>): Sprite {
    let layer = new Sprite();

    for (const obj of layerJSON.objects) {
      const texture = this.gidToSomethingMoreUseful(obj.gid, tilesets);
      if (!texture) continue;

      let tile: Sprite;

      if (this._objectProcessing[obj.gid]) {
        tile = this._objectProcessing[obj.gid](texture, obj);

        if (tile === null) continue;
      } else {
        tile = new Sprite(texture);
      }

      tile.x = obj.x;
      tile.y = obj.y;

      tile.tags.push(layerJSON.name);

      layer.addChild(tile);
    }

    this.addChild(layer);

    return layer;
  }

  private parseTiledMapLayer(layerJSON: TiledMapLayerJSON, tilesets: MagicArray<Tileset>): Sprite {
    let layer = new Sprite();

    layer.baseName = layerJSON.name;

    for (let i = 0; i < layerJSON.data.length; i++) {
      // Find the spritesheet that contains the tile id.

      var value = layerJSON.data[i];

      const texture = this.gidToSomethingMoreUseful(value, tilesets);
      if (!texture) continue;

      const destX = (i % layerJSON.width) * this._tileWidth;
      const destY = Math.floor(i / layerJSON.width) * this._tileHeight;

      let tile: Sprite;

      // Do we have special layer processing logic? If so, use it.

      if (this._layerProcessing[layerJSON.name]) {
        tile = this._layerProcessing[layerJSON.name](texture, destX, destY);

        if (tile === null) continue;
      } else {
        tile = new Sprite(texture);

        tile.x = destX;
        tile.y = destY;
      }

      tile.tags.push(layerJSON.name);

      layer.addChild(tile);
    }

    this.addChild(layer);

    return layer;
  }
}

