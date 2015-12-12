/**
  Maybe type in the spirit of Haskell to indicate nullable types. It doesn't have all the Monadic coolness of Haskell,
  but it indicates nullable types pretty well.
*/
class Maybe<T> {
  public hasValue: boolean = false;
  private _value: T;

  constructor(value: T = undefined) {
    if (value === null) {
      console.error("Never do this.");
    }

    this.value = value;
  }

  then(value: (val: T) => void, nothing: () => void = null): void {
    if (this.hasValue) {
      value(this.value);
    } else if (nothing !== null) {
      nothing();
    }
  }

  get value(): T {
    if (this.hasValue) {
      return this._value;
    }

    console.error("asked for value of Maybe without a value");
  }

  set value(value: T) {
    if (value === null) {
      console.error("Never do this.");
    }
    
    this._value = value;

    this.hasValue = value !== undefined;
  }
}