class Point extends PIXI.Point {
  constructor(x: number, y: number) {
    super(x, y);
  }

  distance(other: Point): number {
    return Math.sqrt(Math.pow(other.x - this.x, 2) + 
                     Math.pow(other.y - this.y, 2));
  }

  add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }
}