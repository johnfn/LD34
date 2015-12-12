class TextField extends Sprite {
  private _textField: PIXI.MultiStyleText;

  public set text(val: string) { this._textField.text = val; }
  public get text(): string { return this._textField.text; }

  constructor(content: string = "<no content dur>") {
    super();

    /*
    this._textField = new PIXI.MultiStyleText("<one>Testing!</one> normal <two>woo</two>", {
      def: { font: "12px Verdana" },
      one: { font: "12px Verdana", fill: "red" },
      two: { font: "12px Verdana", fill: "red" }
    });
    */

    this._textField = new PIXI.MultiStyleText(content, {
      def: { font: "12px Verdana", fill: "white" },
    });

    this.displayObject.addChild(this._textField);
  }

  public setDefaultTextStyle(style: PIXI.TextStyle): this {
    this._textField.setStyle(style);

    return this;
  }
}