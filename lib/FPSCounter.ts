/// <reference path="lib.d.ts"/>

@component(new FixedToCamera(200, 100))
class FPSCounter extends TextField {
  frames: number = 0;
  timeElapsed: number = 0;

  constructor() {
    super("FPS: ???");

    this.z = 50;
  }

  update(): void {
    const now = +new Date;

    this.frames += 1;

    if (now - this.timeElapsed > 1000) {
      this.text = `<one>FPS: ${ this.frames }
Objects: ${ Sprites.all().length() }</one>`;

      this.timeElapsed = now
      this.frames = 0;
    }
  }
}
