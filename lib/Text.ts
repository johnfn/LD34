class TextField extends Sprite {
  private _textField: PIXI.MultiStyleText;

  public set text(val: string) { this._textField.text = val; }
  public get text(): string { return this._textField.text; }

  constructor(content: string = "") {
    super();

    /*
    this._textField = new PIXI.MultiStyleText("<one>Testing!</one> normal <two>woo</two>", {
      def: { font: "12px Verdana" },
      one: { font: "12px Verdana", fill: "red" },
      two: { font: "12px Verdana", fill: "red" }
    });
    */

    this._textField = new PIXI.MultiStyleText("<one>I am a text field.</one>", {
      one: { font: "12px Verdana", fill: "white" },
    });

    this.displayObject.addChild(this._textField);
  }
}