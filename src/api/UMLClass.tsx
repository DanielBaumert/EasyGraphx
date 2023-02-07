import { StringBuilder } from "./StringBuilder";
import { UMLAttribute } from "./UMLAttribute";

export interface IUMLClass {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name: string;
  isAbstract?: boolean;
  attributes: UMLAttribute[];
  toString() : string;
}

export class UMLClass implements IUMLClass {
  x: number;
  y: number;
  width?: number;
  height?: number;
  name: string;
  isAbstract?: boolean;
  attributes: UMLAttribute[];

  constructor() { 
    this.x = 0;
    this.y = 0;
    this.name = "Peter";
    this.attributes = [];
  }

  toString():string {
    var sb = new StringBuilder();

    sb.write(this.name);
    if (this.isAbstract ?? false) {
      sb.newline().write("{abstract}");
    }

    return sb.toString();
  }
}
