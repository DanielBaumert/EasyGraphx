import { Point } from "./DrawUtils";
import { startUpdateView } from "./GlobalState";
import { currentClass, setCurrentClass } from "./Signals";
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
  currentClass().attributes.push(new UMLAttribute());
  setCurrentClass(currentClass());
  startUpdateView();
}
export function popAttribute(attrIndex: number) {
  currentClass().attributes.splice(attrIndex, 1);
  setCurrentClass(currentClass());
  startUpdateView();
}
export function dropAttribute(i: number, e: DragEvent) {
  const src = Number.parseInt(e.dataTransfer.getData("number"));
  currentClass().attributes.splice(
    i,
    0,
    ...currentClass().attributes.splice(src, 1));

  setCurrentClass(currentClass());
  startUpdateView();
}
/*
 * Methode management
 */
export function pushMethode() {
  currentClass().methodes.push(new UMLMethode());
  setCurrentClass(currentClass());
  startUpdateView();
}
export function popMethode(methIndex: number) {
  currentClass().methodes.splice(methIndex, 1);
  setCurrentClass(currentClass());
  startUpdateView();
}
export function dropMethode(i: number, e: DragEvent) {
  const src = Number.parseInt(e.dataTransfer.getData("number"));
  currentClass().methodes.splice(
    i,
    0,
    ...currentClass().methodes.splice(src, 1));

  setCurrentClass(currentClass());
  startUpdateView();
}
/*
 * End - Methode management
 */
/*
 * Parameter management
 */
export function pushParameter(methodeIndex: number) {
  currentClass().methodes[methodeIndex].parameters.push(new UMLParameter())
  setCurrentClass(currentClass());
  startUpdateView();
}
export function popParameter(methIndex: number, parameterIndex: number) {
  currentClass().methodes[methIndex].parameters.splice(parameterIndex, 1);
  setCurrentClass(currentClass());
  startUpdateView();
}
export function dropParameter(methIndex: number, parameterIndex: number, e: DragEvent) {
  const src = Number.parseInt(e.dataTransfer.getData("number"));
  currentClass().methodes[methIndex].parameters.splice(
    parameterIndex,
    0,
    ...currentClass().methodes[methIndex].parameters.splice(src, 1));

  setCurrentClass(currentClass());
  startUpdateView();
}
/*
 * End - Parameter management
 */