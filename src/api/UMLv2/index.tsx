import { drawArrow, drawDotLine, drawLine, fillContainment, fillCrystal, fillTriangle } from "../Drawing/CanvasDrawing";

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


export type UMLClass = { 
  uuid: string;
  x: number;
  y: number;
  property?: string;
  name: string;
  isAbstract?: boolean;
  attributes: UMLAttribute[];
  methodes: UMLMethode[];
};

export type UMLAttribute = {
  isStatic?: boolean;
  isConstant?: boolean;
  accessModifier?: UMLAccessModifiers;
  name: string;
  type?: string;
  multiplicity?: number;
  defaultValue?: string;
}

export type UMLMethode = {
  isStatic?: boolean;
  name: string;
  accessModifier?: UMLAccessModifiers;
  parameters: UMLParameter[];
  returnType?: string;
};

export type UMLParameter = { 
  name?: string, 
  type?: string, 
  defaultValue?: string, 
};

export type UMLRelationship = {
  uuid: string;
  type: UMLRelationshipType;
  parent?: UMLClass;
  children: UMLClass;
};