import { Point } from "./DrawUtils";
import { StringBuilder } from "./StringBuilder";
import { UMLAttribute } from "./UMLAttribute";
import { UMLMethode } from "./UMLMethode";

export interface IUMLClass {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name: string;
  isAbstract?: boolean;
  attributes: UMLAttribute[];
  methodes: UMLMethode[];
  toString() : string;
}

export class UMLClass implements IUMLClass {
  uuid: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  name: string;
  isAbstract?: boolean;
  attributes: UMLAttribute[];
  methodes: UMLMethode[];

  constructor(location: Point) { 
    this.uuid = crypto.randomUUID();
    this.x = location.x;
    this.y = location.y;
    this.name = "class";
    this.attributes = [];
    this.methodes = [];
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
