/// <reference path="../Component.ts"/>

interface TweenEvent {
  (tweenProps: Tween): void;
}

interface Tween{
  /**
   * Name of the tween.
   */
  name: string;

  /**
   * Current frame that we are on.
   */
  currentFrame: number;

  /**
   * Length of tween. Tween is deleted after this many frames.
   */
  duration: number;

  /**
   * Percentage of the way done the animation. A number between 0 and 1.
   * Handy when linearly interpolated.
   */
  percentage: number;

  /**
   * Tween callback function.
   */
  onTick: TweenEvent;
}

class TweenComponent extends Component<Sprite> {
  private _tweens: { [key: string]: Tween};

  constructor() {
    super();

    this._tweens = {};
  }

  update(): void {
    const tweenNames = Object.keys(this._tweens);
    const tweensToDelete: string[] = [];

    for (const name of tweenNames) {
      const tween = this._tweens[name];

      tween.currentFrame++;
      tween.percentage = tween.currentFrame / tween.duration;

      if (tween.currentFrame > tween.duration) {
        tweensToDelete.push(name);
      } else {
        tween.onTick(tween);
      }
    }

    for (const name of tweensToDelete) {
      delete this._tweens[name];
    }
  }

  /**
   * Add tween to tween list.
   * 
   * @param name
   * @param duration
   * @param onTick
   */
  addTween(name: string, duration: number, onTick: TweenEvent) {
    this._tweens[name] = {
      name,
      duration,
      onTick,
      percentage: 0,
      currentFrame: 0,
    };
  }
}