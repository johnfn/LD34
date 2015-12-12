abstract class Component<T extends Sprite> {
  protected _sprite: T;

  constructor() {
  }

  public init(sprite: T) {
    this._sprite = sprite;
  }

  /**
   * These methods have not been thought through or implemented on the Sprite yet.
   */
  public preUpdate(): void {} 
  public abstract update(): void;
  public postUpdate(): void {}

  /**
   * Override to implement cleanup logic when the sprite with this component
   * gets destroyed.
   */
  public destroy(): void {}
}