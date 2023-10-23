import { Point } from "./DrawUtils";
import { startUpdateView } from "./GlobalState";
import { selectedClass, setSelectedClass } from "./Signals";
import { StringBuilder } from "./StringBuilder";
import { UMLAttribute } from "./UMLAttribute";
import { UMLMethode } from "./UMLMethode";
import { UMLParameter } from "./UMLParameter";

export enum UMLContextMenu { 
  Attributes = 0,
  Methodes,
  Derives
}

export interface IUMLClass {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name: string;
  property: string;
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
  property: string;
  name: string;
  isAbstract?: boolean;
  attributes: UMLAttribute[];
  methodes: UMLMethode[];

  constructor(position: Point) {
    this.uuid = crypto.randomUUID();
    this.x = position.x;
    this.y = position.y;
    this.name = "class";
    this.property = "";
    this.attributes = [];
    this.methodes = [];
  }

  toString():string {
    var sb = new StringBuilder();
    if(this.property){
      sb.write("<<").write(this.property).write(">>").newline()
    }

    sb.write(this.name);
    
    if (this.isAbstract) {
      sb.newline().write("{abstract}");
    }

    return sb.toString();
  }
}


export class UMLInterface { 
  public static Create(position: Point) : UMLClass {
    let cls : UMLClass = new UMLClass(position);  
    cls.property = "interface";
    return cls;
  }
}

export class UMLEnum { 
  public static Create(position: Point) : UMLClass {
    let cls : UMLClass = new UMLClass(position);  
    cls.property = "enumerable";
    return cls;
  }
}

/*
 * Attribute management 
 */
export function pushAttribute() {
  selectedClass().attributes.push(new UMLAttribute());
  setSelectedClass(selectedClass());
  startUpdateView();
}
export function popAttribute(attrIndex: number) {
  selectedClass().attributes.splice(attrIndex, 1);
  setSelectedClass(selectedClass());
  startUpdateView();
}
export function dropAttribute(i: number, e: DragEvent) {
  const src = Number.parseInt(e.dataTransfer.getData("number"));
  selectedClass().attributes.splice(
    i,
    0,
    ...selectedClass().attributes.splice(src, 1));

  setSelectedClass(selectedClass());
  startUpdateView();
}
/*
 * Methode management
 */
export function pushMethode() {
  selectedClass().methodes.push(new UMLMethode());
  setSelectedClass(selectedClass());
  startUpdateView();
}
export function popMethode(methIndex: number) {
  selectedClass().methodes.splice(methIndex, 1);
  setSelectedClass(selectedClass());
  startUpdateView();
}
export function dropMethode(i: number, e: DragEvent) {
  const src = Number.parseInt(e.dataTransfer.getData("number"));
  selectedClass().methodes.splice(
    i,
    0,
    ...selectedClass().methodes.splice(src, 1));

  setSelectedClass(selectedClass());
  startUpdateView();
}
/*
 * End - Methode management
 */
/*
 * Parameter management
 */
export function pushParameter(methodeIndex: number) {
  selectedClass().methodes[methodeIndex].parameters.push(new UMLParameter())
  setSelectedClass(selectedClass());
  startUpdateView();
}
export function popParameter(methIndex: number, parameterIndex: number) {
  selectedClass().methodes[methIndex].parameters.splice(parameterIndex, 1);
  setSelectedClass(selectedClass());
  startUpdateView();
}
export function dropParameter(methIndex: number, parameterIndex: number, e: DragEvent) {
  const src = Number.parseInt(e.dataTransfer.getData("number"));
  selectedClass().methodes[methIndex].parameters.splice(
    parameterIndex,
    0,
    ...selectedClass().methodes[methIndex].parameters.splice(src, 1));

  setSelectedClass(selectedClass());
  startUpdateView();
}
/*
 * End - Parameter management
 */