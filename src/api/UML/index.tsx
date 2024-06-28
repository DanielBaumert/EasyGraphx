import { Point } from "../Drawing";
import { drawArrow, drawDotLine, drawLine, fillContainment, fillCrystal, fillTriangle } from "../Drawing/CanvasDrawing";
import { StringBuilder } from "../StringBuilder";

export const UMLLineMode = {
  "Generalization": drawLine,
  "Realization": drawDotLine,
  "Containment": drawLine,
  "Information Flow": drawDotLine,
  "Dependency": drawDotLine,
  "Abstraction": drawDotLine,
  "Subsitution": drawDotLine,
  "Usage": drawDotLine,
  "Association": drawLine,
  "Directional Association": drawLine,
  "Bidirectional Association": drawLine,
  "Composition": drawLine,
  "Aggregation": drawLine
};

export const UMLArrowMode = {
  "Generalization": fillTriangle,
  "Realization": fillTriangle,
  "Containment": fillContainment,
  "Information Flow": drawArrow,
  "Dependency": drawArrow,
  "Abstraction": drawArrow,
  "Subsitution": drawArrow,
  "Usage": drawArrow,
  "Association": undefined,
  "Directional Association": drawArrow,
  "Bidirectional Association": drawArrow,
  "Composition": fillCrystal,
  "Aggregation": fillCrystal,
};


export enum UMLAccessModifiers {
  Public = '+',
  Private = '-',
  Proteced = '#',
  Internal = '~',
}

export enum UMLRelationshipType {
  association = "Association",
  directionalAssociation = "Directional Association",
  bidirectionalAssociation = "Bidirectional Association",
  composition = "Composition",
  aggregation = "Aggregation",
  usage = "Usage",
  subsitution = "Subsitution",
  abstraction = "Abstraction",
  dependency = "Dependency",
  informationFlow = "Information Flow",
  containment = "Containment",
  realization = "Realization",
  generalization = "Generalization",
  none = undefined,
}
export interface IUMLAccessModifiers {
  accessModifier?: UMLAccessModifiers;
}

export interface IUmlAttribute extends IUMLAccessModifiers {
  isStatic?: boolean;
  isConstant?: boolean;
  accessModifier?: UMLAccessModifiers;
  name: string;
  type?: string;
  multiplicity?: number;
  defaultValue?: string;
}

export class UMLAttribute implements IUmlAttribute {
  isStatic?: boolean;
  isConstant?: boolean;
  accessModifier?: UMLAccessModifiers;
  name: string;
  type?: string;
  multiplicity?: number;
  defaultValue?: string;

  constructor() {
    this.name = "attribute";
  }
}

export interface IUMLParameter {
  name?: string;
  type?: string;
}

export class UMLParameter implements IUMLParameter {
  name?: string;
  type?: string;

  constructor() { }
}

export interface IUMLMethode extends IUMLAccessModifiers {
  isStatic?: boolean;
  name: string;
  returnType?: string;
  parameters?: UMLParameter[];
}

export class UMLMethode implements IUMLMethode {
  isStatic?: boolean;
  name: string;
  accessModifier?: UMLAccessModifiers;
  parameters: UMLParameter[];
  returnType?: string;

  constructor() {
    this.name = "methode";
    this.parameters = [];
  }
}


export interface IUMLClass {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name: string;
  property?: string;
  isAbstract?: boolean;
  attributes: UMLAttribute[];
  methodes: UMLMethode[];
}

export class UMLClass implements IUMLClass {
  uuid: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  property?: string;
  name: string;
  isAbstract?: boolean;
  attributes: UMLAttribute[];
  methodes: UMLMethode[];

  constructor(position: Point) {
    this.uuid = crypto.randomUUID();
    this.x = position.x;
    this.y = position.y;
    this.name = "class";
    this.property = undefined;
    this.attributes = [];
    this.methodes = [];
  }
}

export class UMLInterface {
  public static Create(position: Point): UMLClass {
    let cls: UMLClass = new UMLClass(position);
    cls.property = "interface";
    return cls;
  }
}

export class UMLEnum {
  public static Create(position: Point): UMLClass {
    let cls: UMLClass = new UMLClass(position);
    cls.property = "enumerable";
    return cls;
  }
}


export type UMLRelationship = {
  uuid: string;
  type: UMLRelationshipType;
  parent?: UMLClass;
  children: UMLClass;
};


function onUMLAttributeToString(umlAttribute: UMLAttribute): string {
  let sb = new StringBuilder();
  if (umlAttribute.accessModifier) {
    sb.write(umlAttribute.accessModifier).write(" ");
  }
  sb.write(umlAttribute.isConstant ? umlAttribute.name.toUpperCase() : umlAttribute.name);
  if (umlAttribute.type) {
    sb.write(':').write(umlAttribute.type);
  }
  if (umlAttribute.defaultValue) {
    sb.write('=').write(umlAttribute.defaultValue);
  }
  return sb.toString();
}

function onUMLParameterToString(umlParameter: UMLParameter): string {
  let sb = new StringBuilder();

  if (umlParameter.name) {
    sb.write(umlParameter.name);
    if (umlParameter.type) {
      sb.write(":").write(umlParameter.type);
    }
  } else if (umlParameter.type) {
    sb.write(umlParameter.type);
  }

  return sb.toString();
}

function onUMLMethodeToString(umlMethode: UMLMethode): string {
  let sb = new StringBuilder();

  if (umlMethode.accessModifier) {
    sb.write(umlMethode.accessModifier).write(' ');
  }

  sb.write(umlMethode.name).write('(')
    .write(umlMethode.parameters.map((x : UMLParameter) => UmlToString(x)).join(", "))
    .write(')');

  if (umlMethode.returnType) {
    sb.write(':').write(umlMethode.returnType);
  } else {
    sb.write(":void");
  }

  return sb.toString();
}

function onUMLClassToString(umlClass: UMLClass): string {
  let sb = new StringBuilder();

  if (umlClass.property !== undefined) {
    sb.write("<<").write(umlClass.property).write(">>").newline();
  }

  sb.write(umlClass.name);

  if (umlClass.isAbstract) {
    sb.newline().write("{abstract}");
  }

  return sb.toString();
}

export function UmlToString(umlAttribute: UMLAttribute): string;
export function UmlToString(umlParameter: UMLParameter): string;
export function UmlToString(umlMethode: UMLMethode): string;
export function UmlToString(umlClass: UMLClass): string;
export function UmlToString(
  uml: UMLAttribute | UMLParameter | UMLMethode | UMLClass): string {

  if (uml instanceof UMLAttribute) {
    return onUMLAttributeToString(uml);
  }
  if (uml instanceof UMLParameter) {
    return onUMLParameterToString(uml);
  }
  if (uml instanceof UMLMethode) {
    return onUMLMethodeToString(uml);
  }
  if (uml instanceof UMLClass) {
    return onUMLClassToString(uml);
  }
}