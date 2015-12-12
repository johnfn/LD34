

declare module PIXI {
  interface Style {
    /**
     * Example: "bold 20pt Arial
     */
    font?: string;
    fill?: string | number;
    stroke?: string | number;
    strokeThickness?: number

    dropShadow?: boolean;
    dropShadowAngle?: number;
    dropShadowDistance?: number;
    dropShadowColor?: string;
  }

  interface LineStyle {
    align: string;
    wordWrap: boolean;
    wordWrapWidth: number;
  }

  export class MultiStyleText extends PIXI.Text {
    /**
     * A Multi-Style Text Object will create a line or multiple lines of text, using tags to specify different styles.
     * A tag is similar to an html tag, except you can use whatever keyword you want. (e.g. <myTag>My text</myTag>)
     *
     * @class MultiStyleText
     * @extends Text
     * @constructor
     * @param text {String} The copy that you would like the text to display
     * @param [textStyles] {Object.<string, Style>} The text styles object parameters. A key of this object is a tag name, and the content must be a style object. The key `def` specifies the default styles. The style object is the same as the one in Pixi.Text.
     * @param [lineStyle] {Object} The global style parameters
     * @param [lineStyle.align='left'] {String} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
     * @param [lineStyle.wordWrap=false] {Boolean} Indicates if word wrap should be used
     * @param [lineStyle.wordWrapWidth=100] {Number} The width at which text will wrap, it needs wordWrap to be set to true
     */
    constructor(text: string, textStyles: { [key: string]: Style }, lineStyle?: PIXI.LineStyle);


    /**
     * Set the global alignment style of the text
     *
     * @method setAlignmentStyle
     * @param [style] {Object} The global alignment style parameters
     * @param [style.align='left'] {String} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
     * @param [style.wordWrap=false] {Boolean} Indicates if word wrap should be used
     * @param [style.wordWrapWidth=100] {Number} The width at which text will wrap
     */
    setAlignmentStyle(style: Style): void;

    /**
     * Set the global alignment style of the text
     *
     * @method setAlignmentStyle
     * @param [style] {Object} The global alignment style parameters
     * @param [style.align='left'] {String} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
     * @param [style.wordWrap=false] {Boolean} Indicates if word wrap should be used
     * @param [style.wordWrapWidth=100] {Number} The width at which text will wrap
     */
    setStyle(style: Style): void;

    setDefaultTextStyle(style: Style): void;

    /**
     * Set the text styles for each tag
     * Use the key `def` to specify the default styles
     *
     * @method setTextStyles
     * @param [styles] {Object.<string,Style>} The style map where the key is the tag name.
     */
    setTextStyles(styles: { [key: string]: Style }): void;
  }
}