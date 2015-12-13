class Util {
  static Draw(item: Ray | Point | Polygon | PIXI.Rectangle, color: number = 0xff0000, alpha: number = 1) {
    Globals.stage.debug.draw(item, color, alpha);
  }

  static RunOnStart(func: () => void) {
    if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {
      setTimeout(func); // setTimeout to allow the rest of the script to load.
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        func();
      });
    }
  }

  /**
   * Clone obj, optionally copying over key value pairs from props onto obj.
   * Currently too stupid to do cycle detection... blehhhhh.
   */
  static Clone<T>(obj: T): T {
    if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj)
      return obj;

    var result: T = Object.create(Object.getPrototypeOf(obj));

    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        (obj as any)['isActiveClone'] = null;
        (result as any)[key] = Util.Clone((obj as any)[key]);
        delete (obj as any)['isActiveClone'];
      }
    }

    return result;
  }


  /**
   * Converts a single word to Title Case.
   * @param s 
   * @returns {} 
   */
  static ToTitleCase(s: string): string {
    return s[0].toUpperCase() + s.slice(1).toLowerCase();
  }

  static ArrayEq(a: any[], b: any[]): boolean {
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }

    return true;
  }

  static Sum(a: number[]): number {
    let result = 0;

    for (let i = 0; i < a.length; i++) {
      result += a[i];
    }

    return result;
  }

  /**
   * Returns the point of intersection, or null if there wasn't one.
   * 
   * @param ray1 
   * @param ray2 
   * @returns {} 
   */
  static RayRayIntersection(ray0: Ray, ray1: Ray): Maybe<Point> {
    const p0_x = ray0.x0;
    const p0_y = ray0.y0;

    const p1_x = ray0.x1;
    const p1_y = ray0.y1;

    const p2_x = ray1.x0;
    const p2_y = ray1.y0;

    const p3_x = ray1.x1;
    const p3_y = ray1.y1;

    let s1_x: number = p1_x - p0_x; let s1_y: number = p1_y - p0_y;
    let s2_x: number = p3_x - p2_x; let s2_y: number = p3_y - p2_y;

    let s: number = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    let t: number = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      return new Maybe(new Point(p0_x + (t * s1_x), p0_y + (t * s1_y)))
    }

    return new Maybe<Point>();
  }

  /**
   * Returns whether the given point is inside the given rect.
   * @param rect 
   * @param point 
   * @returns {} 
   */
  static RectPointIntersection(rect: PIXI.Rectangle, point: Point): boolean {
    return rect.x <= point.x && rect.x + rect.width  >= point.x &&
           rect.y <= point.y && rect.y + rect.height >= point.y;
  }

  /**
   * Returns a random number between min and max.
   * 
   * @param min
   * @param max
   */
  static RandomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Choose a random element of the provided array.
   * @param arr
   */
  static RandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Util.RandomRange(0, arr.length))];
  }

  /**
   * Generate a point selected randomly from all points on the unit circle.
   * 
   * Handy for all sorts of things. If you can't of a thing this is handy for,
   * then you suck.
   */
  static RandomPointOnUnitCircle(): PIXI.Point {
    const theta = 2 * Math.PI * Math.random();

    return new PIXI.Point(Math.sin(theta), Math.cos(theta));
  }

  /**
   * Linearly interpolate value (expected to be between 0-1) in between from and to.
   * @param from
   * @param to
   * @param value
   */
  static Lerp(from: number, to: number, value: number): number {
    return from + (to - from) * value;
  }

  /**
   * Return the percentage that value is between from and to.
   * 
   * TODO: I'm sure there's a better name for this LOL
   * @param from
   * @param to
   * @param value
   */
  static AntiLerp(from: number, to: number, value: number): number {
    return (value - from) / (to - from);
  }

  /**
   * Returns whether two rectangles are touching.
   * @param r1
   * @param r2
   */
  static RectRectIntersection(r1: PIXI.Rectangle, r2: PIXI.Rectangle): boolean {
    return !(r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y);
  }

  static Sign(val: number): number {
    if (val > 0) return 1;
    if (val < 0) return -1;
    return 0;
  }

  /**
   * Returns the point of collision of a ray and a rectangle that is closest
   * to the start of the ray, if there is one. 
   * @param ray 
   * @param rect 
   * @returns {} 
   */
  static RayRectIntersection(ray: Ray, rect: PIXI.Rectangle): Maybe<Point> {
    const lines: Ray[] = [
      new Ray(rect.x, rect.y, rect.x + rect.width, rect.y ),
      new Ray(rect.x, rect.y, rect.x, rect.y + rect.height ),
      new Ray(rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height ),
      new Ray(rect.x, rect.y + rect.height, rect.x + rect.width, rect.y + rect.height)
    ];

    let closest: Point = undefined;

    for (const rectLine of lines) {
      Util.RayRayIntersection(ray, rectLine).then(intersection => {
        if (closest == null || intersection.distance(ray.start) < closest.distance(ray.start)) {
          closest = intersection;
        }
      })
    }

    return new Maybe<Point>(closest);
  }

  static GetClassName(target: any) {
    if (target == null) {
      return "[null]";
    }

    if (target == undefined) {
      return "[undefined]";
    }

    // You can do something like Object.create(null) and make an object
    // with no constructor. Weird.
    if (!target.constructor) {
      return "[object]";
    }

    if ((target as any).__className) {
      return (target as any).__className;
    }

    let constructor = ("" + target.constructor);
    let result: string;

    if (constructor.indexOf("function ") !== -1) {
      result = ("" + target.constructor).split("function ")[1].split("(")[0];
    } else {
      result = "[stubborn builtin]"
    }

    (target as any).__className = result;

    return result;
  }

  static StartsWith(str: string, prefix: string): boolean {
    return str.lastIndexOf(prefix, 0) === 0;
  }

  static Contains(str: string, inner: string): boolean {
    return str.toUpperCase().indexOf(inner.toUpperCase()) !== -1;
  }
}

/**
 * Adds console.watch to watch variables and hit breakpoints on changes
 * (handy for hunting down hard to find bugs!)
 */
(console as any).watch = function (oObj: any, sProp: any) {
  let sPrivateProp = "$_" + sProp + "_$"; // to minimize the name clash risk
  oObj[sPrivateProp] = oObj[sProp];

  // overwrite with accessor
  Object.defineProperty(oObj, sProp, {
    get: function () {
      return oObj[sPrivateProp];
    },

    set: function (value) {
      //console.log("setting " + sProp + " to " + value);
      debugger; // sets breakpoint
      oObj[sPrivateProp] = value;
    }
  });
}
