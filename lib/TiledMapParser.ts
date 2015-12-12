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

class TiledMapParser extends Sprite {
  private _rootPath: string;
  private _layers: { [key: string]: Sprite; };

  constructor(path: string) {
    super();

    this._rootPath = path.slice(0, path.lastIndexOf("/") + 1);

    let request = new XMLHttpRequest();
    request.open('GET', path + "?" + Math.random(), true); // Cachebust the path to the map.
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
        let tile = new Sprite(texture);

        layer.addChild(tile);

        tile.x = destX;
        tile.y = destY;
      }

      this.addChild(layer);

      this._layers[layerJSON.name] = layer;
    }
  }
}

