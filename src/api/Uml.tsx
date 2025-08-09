export enum UMLAccessModifiers {
  Public = '+',
  Private = '-',
  Protected = '#',
  Internal = '~',
}

export class UMLClass {
  public accessModifier?: UMLAccessModifiers;
  public name: string;
  public property: string;
  public isAbstract?: boolean;
  public attributes: UMLAttribute[];
  public methods: UMLMethode[];

  public constructor(init?:Partial<UMLClass>) {
    Object.assign(this, init);
  }
}

export class UMLAttribute {
  public isStatic?: boolean;
  public isConstant?: boolean;
  public accessModifier?: UMLAccessModifiers;
  public name: string;
  public type?: string;
  public multiplicity?: number;
  public defaultValue?: string;

  public constructor(init?:Partial<UMLAttribute>) {
    Object.assign(this, init);
  }
}

export class UMLMethode {
  public isStatic?: boolean;
  public accessModifier?: UMLAccessModifiers;
  public name: string;
  public returnType?: string;
  public parameters?: UMLParameter[];

  public constructor(init?:Partial<UMLMethode>) {
    Object.assign(this, init);
  }
}

export class UMLParameter {
  public name: string;
  public type?: string;
  public defaultValue?: string;

  public constructor(init?:Partial<UMLParameter>) {
    Object.assign(this, init);
  }
};

class StringBuilder {
  private _lines: string[] = [];

  write(line: string = ''): StringBuilder {
    this._lines.push(line);
    return this;
  }

  newline(): StringBuilder {
    this._lines.push(`
      `);
    return this;
  }

  writeln(line: string = ''): StringBuilder {
    this._lines.push(line);
    this._lines.push('\n');
    return this;
  }

  toString(): string {
    return this._lines.join('');
  }
}


function onUMLAttributeToString(umlAttribute: UMLAttribute): string {
  let sb = new StringBuilder();
  if (umlAttribute.accessModifier) {
    sb.write(umlAttribute.accessModifier).write(' ');
  }
  sb.write(umlAttribute.isConstant ? umlAttribute.name.toUpperCase() : umlAttribute.name);
  if (umlAttribute.type) {
    sb.write(' : ').write(umlAttribute.type);
  }
  if (umlAttribute.defaultValue) {
    sb.write(' = ').write(umlAttribute.defaultValue);
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
    .write(umlMethode.parameters?.map((x : UMLParameter) => UmlToString(x)).join(", ") ?? '')
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

  throw new Error("Unknown UML type");
}