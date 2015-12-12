/* PIXI.Polygon is good, but it does not allow us to get the points that we passed in ourselves 
   (easily), which is just dumb. */

class Polygon {
  private _pixiPolygon: PIXI.Polygon;

  public get points(): PIXI.Point[] {
    let result: PIXI.Point[] = [];

    for (var i = 0; i < this._pixiPolygon.points.length; i += 2) {
      result.push(new PIXI.Point(this._pixiPolygon.points[i], this._pixiPolygon.points[i + 1]));
    }

    return result;
  }

  constructor(points: PIXI.Point[]) {
    this._pixiPolygon = new PIXI.Polygon(points);
  }

  public contains(point: PIXI.Point): boolean {
    return this._pixiPolygon.contains(point.x, point.y)
  }
}