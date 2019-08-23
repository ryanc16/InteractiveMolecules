import { RenderingStyles } from "./rendering-styles.model";

export class Atom implements AtomModel {
  private $hashKey: string;
  public get hashKey(): string {
    return this.$hashKey;
  }
  private renderingStyles: RenderingStyles;

  constructor(public name: string, public abbr: string, public atomicNumber: number, public radius: number, renderingStyles?: RenderingStyles) {
    this.$hashKey = Object.keys(this).map(key => this[key]).reduce((prev, next) => prev + next) + Math.round(Math.random() * 1e10);
    this.renderingStyles = renderingStyles;
  }

  setRenderingStyles(styles: RenderingStyles) {
    this.renderingStyles = styles;
  }

  getRenderingStyles(): RenderingStyles {
    return this.renderingStyles;
  }

  clone(): AtomModel {
    const clone = new Atom(null, null, null, null);
    let hash = clone.$hashKey;
    Object.assign(clone, this);
    clone.$hashKey = hash;
    return clone;
  }

}

export interface AtomModel {
  atomicNumber: number;
  radius: number;
  abbr: string;
  name: string;
}