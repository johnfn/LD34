/// <reference path="../Component.ts"/>

class DestroyWhenOffscreen extends Component<Sprite> {
  update(): void {
    const stage = Globals.stage;

    if (this._sprite.x < 0 || this._sprite.x > stage.width ||
        this._sprite.y < 0 || this._sprite.y > stage.height) {

      this._sprite.destroy();
    }
  }
}