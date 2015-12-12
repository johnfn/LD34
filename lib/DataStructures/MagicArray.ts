class MagicArray<T> extends Array<T> {
  constructor(contents: T | T[] = undefined) {
    super();

    if (contents) {
      if (contents instanceof Array) {
        for (var a of contents) {
          this.push(a);
        }
      } else {
        this.push(contents as any);
      }
    }
  }

  /**
    Returns a new array with all o removed.
  */
  remove(o: T): MagicArray<T> {
    var result = new MagicArray<T>();

    for (var i = 0; i < this.length; i++) {
      if (this[i] !== o) {
        result.push(this[i]);
      }
    }

    return result;
  }

  each(fn: (o: T) => void): void {
    for (var a of this) {
      fn(a);
    }
  }

  find(key: (o: T) => boolean): T {
    for (var a of this) {
      if (key(a)) return a;
    }

    return null;
  }

  clear(): MagicArray<T> {
    return new MagicArray<T>();
  }

  filter(fn: (o: T) => boolean): MagicArray<T> {
    var result = new MagicArray<T>();

    for (var i = 0; i < this.length; i++) {
      let val = this[i];

      if (fn(val)) {
        result.push(val);
      }
    }

    return result;
  }

  map<U>(fn: (o: T) => U): MagicArray<U> {
    var result = new MagicArray<U>();
    
    for (var i = 0; i < this.length; i++) {
      result.push(fn(this[i]));
    }

    return result;
  }

  /**
   * Sorts by provided key. Returns newly sorted array.
   */
  sortByKey(key: (o: T) => number): MagicArray<T> {
    var result = this
      .slice()
      .sort((a: T, b: T) => key(a) - key(b));

    return new MagicArray<T>(result);
  }

  arr(): T[] {
    var result: T[] = [];

    for (var i = 0; i < this.length; i++) {
      result.push(this[i]);
    }
    
    return result;
  }

  addAll(o: MagicArray<T>): void {
    for (const item of o) {
      this.push(item);
    }
  }
}
